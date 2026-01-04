# audio_analyzer.py - Audio Emotion Analysis Module
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime
import os
import numpy as np
import librosa
import soundfile as sf
from pydub import AudioSegment
import io
import tempfile
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import time

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
HF_TOKEN = os.getenv("HF_TOKEN")
AUDIO_MODEL = "firdhokk/speech-emotion-recognition-with-openai-whisper-large-v3"
SAMPLE_RATE = 16000
MAX_DURATION = 30  # seconds

class AudioProcessor:
    """Handle audio file processing"""
    
    @staticmethod
    def convert_to_wav(audio_bytes: bytes, input_format: str) -> bytes:
        """Convert any audio format to WAV"""
        try:
            audio = AudioSegment.from_file(io.BytesIO(audio_bytes), format=input_format)
            wav_buffer = io.BytesIO()
            audio.export(wav_buffer, format="wav")
            return wav_buffer.getvalue()
        except Exception as e:
            raise ValueError(f"Audio conversion failed: {str(e)}")
    
    @staticmethod
    def load_audio(audio_bytes: bytes, target_sr: int = 16000) -> tuple:
        """Load audio bytes and convert to numpy array"""
        try:
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name
            
            audio, sr = librosa.load(tmp_path, sr=target_sr, duration=MAX_DURATION)
            os.unlink(tmp_path)
            
            return audio, sr
        except Exception as e:
            raise ValueError(f"Audio loading failed: {str(e)}")
    
    @staticmethod
    def validate_audio(audio_bytes: bytes) -> dict:
        """Validate audio file"""
        validation = {
            "valid": False,
            "error": None,
            "duration": 0,
            "sample_rate": 0
        }
        
        try:
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name
            
            info = sf.info(tmp_path)
            validation["duration"] = info.duration
            validation["sample_rate"] = info.samplerate
            
            if info.duration > MAX_DURATION:
                validation["error"] = f"Audio too long. Max: {MAX_DURATION}s"
            elif info.duration < 1:
                validation["error"] = "Audio too short. Min: 1s"
            else:
                validation["valid"] = True
            
            os.unlink(tmp_path)
        except Exception as e:
            validation["error"] = f"Validation failed: {str(e)}"
        
        return validation

class AudioEmotionAnalyzer:
    """Audio emotion analyzer using Hugging Face models"""
    
    def __init__(self, hf_token: str = None):
        self.hf_token = hf_token or HF_TOKEN
        self.initialized = False
        self.audio_processor = AudioProcessor()
        
        # Risk patterns
        self.RISK_PATTERNS = {
            "CRITICAL": ["suicide", "kill myself", "end my life", "want to die"],
            "HIGH": ["hopeless", "worthless", "self harm", "no future"],
            "MEDIUM": ["depressed", "anxious", "stressed", "lonely"],
            "LOW": ["sad", "worried", "tired", "frustrated"]
        }
        
        # Emergency resources
        self.EMERGENCY_HELPLINES = {
            "Vandrevala Foundation": "9999666555",
            "iCall": "+91-9152987821",
            "AASRA": "91-9820466726",
            "SNEHA": "044-24640050",
            "National Mental Health Helpline": "08046110007"
        }
        
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize Hugging Face models"""
        try:
            logger.info(f"Initializing audio model: {AUDIO_MODEL}")
            
            if self.hf_token:
                self.client = InferenceClient(token=self.hf_token, timeout=60)
                logger.info("Using Hugging Face Inference API")
                self.use_inference_api = True
            else:
                logger.warning("No HF_TOKEN found, using fallback analysis")
                self.use_inference_api = False
            
            self.initialized = True
            logger.info("Audio analyzer initialized successfully")
            
        except Exception as e:
            logger.error(f"Model initialization failed: {str(e)}")
            self.initialized = False
    
    def analyze_emotion(self, audio_array: np.ndarray, sample_rate: int = 16000) -> Dict[str, Any]:
        """Analyze emotion from audio"""
        try:
            # Resample if needed
            if sample_rate != SAMPLE_RATE:
                audio_array = librosa.resample(audio_array, orig_sr=sample_rate, target_sr=SAMPLE_RATE)
            
            # Convert to bytes for API
            buffer = io.BytesIO()
            sf.write(buffer, audio_array, SAMPLE_RATE, format='WAV')
            audio_bytes = buffer.getvalue()
            
            if self.use_inference_api and hasattr(self, 'client'):
                # Use Hugging Face Inference API
                try:
                    result = self.client.audio_classification(
                        audio_bytes,
                        model=AUDIO_MODEL
                    )
                    
                    if result:
                        # Parse results
                        emotions = {}
                        for item in result:
                            emotion = item.get('label', '').lower()
                            score = item.get('score', 0.0)
                            emotions[emotion] = float(score)
                        
                        # Get primary emotion
                        primary_emotion = max(emotions.items(), key=lambda x: x[1])[0] if emotions else "neutral"
                        
                        return {
                            "primary_emotion": primary_emotion,
                            "emotion_scores": emotions,
                            "confidence": emotions.get(primary_emotion, 0.5),
                            "method": "hugging_face_api"
                        }
                except Exception as e:
                    logger.warning(f"HF API failed: {str(e)}, using fallback")
            
            # Fallback analysis
            return self._fallback_emotion_analysis(audio_array)
            
        except Exception as e:
            logger.error(f"Emotion analysis error: {str(e)}")
            return self._fallback_emotion_analysis(audio_array)
    
    def _fallback_emotion_analysis(self, audio_array: np.ndarray) -> Dict[str, Any]:
        """Fallback emotion analysis using audio features"""
        try:
            # Extract audio features
            mfcc = librosa.feature.mfcc(y=audio_array, sr=SAMPLE_RATE, n_mfcc=13)
            spectral_centroid = librosa.feature.spectral_centroid(y=audio_array, sr=SAMPLE_RATE)
            zero_crossing_rate = librosa.feature.zero_crossing_rate(audio_array)
            
            # Calculate statistics
            mfcc_mean = np.mean(mfcc)
            spectral_mean = np.mean(spectral_centroid)
            zcr_mean = np.mean(zero_crossing_rate)
            energy = np.sum(audio_array ** 2) / len(audio_array)
            
            # Simple heuristic-based emotion detection
            emotions = {
                "neutral": 0.3,
                "calm": 0.2,
                "happy": 0.1,
                "sad": 0.1,
                "angry": 0.1,
                "fearful": 0.1,
                "disgust": 0.05,
                "surprised": 0.05
            }
            
            # Adjust based on features
            if energy > 0.01:
                emotions["angry"] += 0.2
                emotions["fearful"] += 0.1
            else:
                emotions["calm"] += 0.2
                emotions["sad"] += 0.1
            
            if spectral_mean > 2000:
                emotions["happy"] += 0.15
                emotions["surprised"] += 0.1
            else:
                emotions["sad"] += 0.15
            
            # Normalize
            total = sum(emotions.values())
            emotions = {k: v/total for k, v in emotions.items()}
            
            primary_emotion = max(emotions.items(), key=lambda x: x[1])[0]
            
            return {
                "primary_emotion": primary_emotion,
                "emotion_scores": emotions,
                "confidence": emotions[primary_emotion],
                "method": "fallback_analysis"
            }
            
        except Exception as e:
            logger.error(f"Fallback analysis error: {str(e)}")
            return {
                "primary_emotion": "neutral",
                "emotion_scores": {"neutral": 1.0},
                "confidence": 0.5,
                "method": "default"
            }
    
    def calculate_risk_score(self, emotion_scores: Dict[str, float]) -> tuple:
        """Calculate risk score from emotion scores"""
        # Risk weights for emotions
        risk_weights = {
            "sad": 60,
            "fearful": 70,
            "angry": 50,
            "disgust": 40,
            "neutral": 25,
            "calm": 15,
            "happy": 10,
            "surprised": 20
        }
        
        risk_score = 0
        for emotion, score in emotion_scores.items():
            weight = risk_weights.get(emotion, 30)
            risk_score += weight * score
        
        # Determine risk level
        if risk_score >= 75:
            risk_level = "CRITICAL"
        elif risk_score >= 55:
            risk_level = "HIGH"
        elif risk_score >= 35:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        return risk_level, risk_score
    
    def get_recommendations(self, risk_level: str, primary_emotion: str) -> List[str]:
        """Get recommendations based on risk level and emotion"""
        base_recommendations = {
            "LOW": [
                "Continue monitoring your emotional wellbeing",
                "Practice relaxation techniques when needed",
                "Maintain healthy sleep and exercise habits"
            ],
            "MEDIUM": [
                "Consider speaking with a counselor or therapist",
                "Practice stress management techniques regularly",
                "Reach out to supportive friends or family"
            ],
            "HIGH": [
                "Seek professional mental health support soon",
                "Create a safety plan with trusted contacts",
                "Avoid isolation and stay connected with others"
            ],
            "CRITICAL": [
                "🚨 Contact a crisis helpline immediately",
                "🚨 Seek emergency mental health services",
                "🚨 Do not stay alone - reach out to someone now"
            ]
        }
        
        recommendations = base_recommendations.get(risk_level, base_recommendations["MEDIUM"]).copy()
        
        # Add emotion-specific recommendations
        if primary_emotion in ["sad", "fearful"]:
            recommendations.append("Engage in activities that uplift your mood")
        elif primary_emotion == "angry":
            recommendations.append("Practice anger management techniques")
        
        return recommendations[:3]
    
    def analyze_audio_file(self, audio_bytes: bytes, file_format: str) -> Dict[str, Any]:
        """Main method to analyze audio file"""
        start_time = time.time()
        
        try:
            # Validate audio
            validation = self.audio_processor.validate_audio(audio_bytes)
            if not validation["valid"]:
                raise ValueError(validation["error"])
            
            # Convert to WAV if needed
            if file_format != "wav":
                audio_bytes = self.audio_processor.convert_to_wav(audio_bytes, file_format)
            
            # Load audio
            audio_array, sample_rate = self.audio_processor.load_audio(audio_bytes)
            
            # Analyze emotion
            emotion_result = self.analyze_emotion(audio_array, sample_rate)
            
            # Calculate risk
            risk_level, risk_score = self.calculate_risk_score(emotion_result["emotion_scores"])
            
            # Get recommendations
            recommendations = self.get_recommendations(risk_level, emotion_result["primary_emotion"])
            
            # Determine next step
            next_steps = {
                "LOW": "Continue self-care practices and monitor your wellbeing",
                "MEDIUM": "Consider professional consultation for additional support",
                "HIGH": "Urgently seek professional mental health support",
                "CRITICAL": "Immediate intervention required - contact emergency services"
            }
            
            # Prepare warning flags
            warning_flags = []
            if risk_level in ["HIGH", "CRITICAL"]:
                warning_flags.append(f"Detected {risk_level} risk level from audio analysis")
            
            processing_time = time.time() - start_time
            
            return {
                "success": True,
                "risk_level": risk_level,
                "risk_score": round(risk_score, 2),
                "confidence": round(emotion_result["confidence"], 3),
                "primary_emotion": emotion_result["primary_emotion"],
                "emotion_scores": emotion_result["emotion_scores"],
                "detected_emotions": list(emotion_result["emotion_scores"].keys())[:5],
                "audio_duration": float(validation["duration"]),
                "sample_rate": validation["sample_rate"],
                "format": file_format,
                "recommendations": recommendations,
                "warning_flags": warning_flags,
                "next_step": next_steps[risk_level],
                "emergency_helplines": self.EMERGENCY_HELPLINES,
                "analysis_timestamp": datetime.now().isoformat(),
                "model_used": AUDIO_MODEL if emotion_result["method"] == "hugging_face_api" else "Fallback Analysis",
                "processing_time": round(processing_time, 2)
            }
            
        except Exception as e:
            logger.error(f"Audio analysis failed: {str(e)}")
            raise Exception(f"Audio analysis error: {str(e)}")
