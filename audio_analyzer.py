import logging
import os
import time
import json
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
import numpy as np

from huggingface_hub import InferenceClient
from transformers import pipeline
import torch

from models.schemas import MentalHealthResources
from utils.audio_processing import AudioProcessor

logger = logging.getLogger(__name__)


class AudioEmotionAnalyzer:
    """Advanced audio emotion analyzer using Hugging Face models"""
    
    def __init__(self, hf_token: str = None):
        self.hf_token = hf_token or os.getenv("HF_TOKEN")
        self.initialized = False
        self.audio_processor = AudioProcessor()
        
        # Model configuration
        self.AUDIO_MODEL = "firdhokk/speech-emotion-recognition-with-openai-whisper-large-v3"
        self.SAMPLE_RATE = 16000
        self.MAX_DURATION = 30  # seconds
        
        # Emotion mapping to risk levels
        self.EMOTION_RISK_MAPPING = {
            "CRITICAL": ["anger", "disgust", "fear", "sadness"],
            "HIGH": ["anger", "fear", "sadness", "disgust"],
            "MEDIUM": ["neutral", "surprise", "frustration"],
            "LOW": ["happy", "calm", "excited", "joyful"]
        }
        
        # Risk keywords in transcription
        self.RISK_PATTERNS = {
            "CRITICAL": [
                "suicide", "kill myself", "end my life", "want to die", "ending it all",
                "no reason to live", "better off dead", "suicidal", "final goodbye",
                "give up", "done with life", "escape pain", "death wish",
                "commit suicide", "take my life", "end everything", "no hope",
                "family burden", "cannot face", "final solution", "no way out"
            ],
            "HIGH": [
                "hopeless", "worthless", "burden", "empty", "numb",
                "self harm", "cutting", "overdose", "harm myself",
                "no future", "nothing matters", "lost all hope",
                "failure", "disappointment", "shame", "guilt",
                "useless", "good for nothing", "waste", "loser"
            ],
            "MEDIUM": [
                "depressed", "anxious", "overwhelmed", "stressed", "lonely",
                "can't sleep", "panic", "fear", "scared", "worried",
                "exhausted", "burned out", "isolated", "helpless",
                "tension", "pressure", "worried sick", "overthinking"
            ],
            "LOW": [
                "sad", "worried", "tense", "unhappy", "frustrated",
                "annoyed", "disappointed", "tired", "exhausted",
                "down", "moody", "irritable", "upset"
            ]
        }
        
        # Mental health resources
        self.MENTAL_HEALTH_RESOURCES = {
            "emergency_helplines": {
                "Vandrevala Foundation": "9999666555",
                "iCall": "+91-9152987821",
                "AASRA": "91-9820466726",
                "SNEHA": "044-24640050",
                "Connecting NGO": "9922004305",
                "Roshni Trust": "040-66202000"
            },
            "telemedicine_services": {
                "Manas": "14416",
                "Mpower": "1800-120-820050",
                "Fortis Stress Helpline": "+91-8376804102"
            },
            "government_resources": {
                "National Mental Health Helpline": "08046110007",
                "Ministry of Social Justice": "14443"
            },
            "regional_support": {
                "Delhi": "011-23389090",
                "Mumbai": "022-25521111",
                "Bangalore": "080-25497777",
                "Chennai": "044-24640050",
                "Kolkata": "033-24637401"
            }
        }
        
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize Hugging Face models"""
        try:
            if not self.hf_token:
                logger.warning("HF_TOKEN not found. Models will be initialized without authentication (if possible).")
            
            # Initialize inference client
            self.client = InferenceClient(
                token=self.hf_token,
                timeout=60.0
            )
            
            # Try to load audio classification model
            logger.info(f"Initializing audio model: {self.AUDIO_MODEL}")
            
            # Test the model
            test_audio = np.zeros((self.SAMPLE_RATE * 2,))  # 2 seconds of silence
            
            # Check if model is accessible
            try:
                # Use audio classification endpoint
                result = self.client.audio_classification(
                    audio=test_audio,
                    model=self.AUDIO_MODEL
                )
                logger.info(f"Audio model test successful")
            except Exception as e:
                logger.warning(f"Audio model test failed: {str(e)}")
                # Try with transformers pipeline as fallback
                self._initialize_transformers_pipeline()
            
            self.initialized = True
            logger.info("Audio emotion analyzer initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize models: {str(e)}")
            self.initialized = False
    
    def _initialize_transformers_pipeline(self):
        """Initialize transformers pipeline as fallback"""
        try:
            logger.info("Initializing transformers pipeline as fallback")
            self.pipeline = pipeline(
                "audio-classification",
                model=self.AUDIO_MODEL,
                token=self.hf_token
            )
            logger.info("Transformers pipeline initialized successfully")
            self.use_pipeline = True
        except Exception as e:
            logger.error(f"Failed to initialize transformers pipeline: {str(e)}")
            self.use_pipeline = False
    
    def analyze_audio_emotion(self, audio_array: np.ndarray, sample_rate: int = 16000) -> Dict[str, Any]:
        """Analyze emotion from audio using Hugging Face model"""
        try:
            # Ensure audio is in correct format
            if sample_rate != self.SAMPLE_RATE:
                # Resample if needed
                import librosa
                audio_array = librosa.resample(
                    audio_array, 
                    orig_sr=sample_rate, 
                    target_sr=self.SAMPLE_RATE
                )
            
            # Convert to bytes for API
            import io
            import soundfile as sf
            
            buffer = io.BytesIO()
            sf.write(buffer, audio_array, self.SAMPLE_RATE, format='WAV')
            audio_bytes = buffer.getvalue()
            
            # Use Hugging Face Inference API
            if hasattr(self, 'client'):
                try:
                    result = self.client.audio_classification(
                        audio=audio_bytes,
                        model=self.AUDIO_MODEL
                    )
                    
                    # Process results
                    emotion_scores = {}
                    for item in result:
                        emotion_scores[item['label']] = item['score']
                    
                    return {
                        "success": True,
                        "emotion_scores": emotion_scores,
                        "primary_emotion": max(emotion_scores, key=emotion_scores.get),
                        "model": self.AUDIO_MODEL,
                        "method": "inference_api"
                    }
                    
                except Exception as api_error:
                    logger.warning(f"Inference API failed: {str(api_error)}")
            
            # Fallback to transformers pipeline
            if hasattr(self, 'pipeline') and self.use_pipeline:
                try:
                    result = self.pipeline(audio_array)
                    
                    emotion_scores = {}
                    for item in result:
                        emotion_scores[item['label']] = item['score']
                    
                    return {
                        "success": True,
                        "emotion_scores": emotion_scores,
                        "primary_emotion": max(emotion_scores, key=emotion_scores.get),
                        "model": self.AUDIO_MODEL,
                        "method": "transformers_pipeline"
                    }
                    
                except Exception as pipe_error:
                    logger.error(f"Pipeline failed: {str(pipe_error)}")
            
            # Ultimate fallback
            return self._get_fallback_analysis(audio_array)
            
        except Exception as e:
            logger.error(f"Audio emotion analysis failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "emotion_scores": {"neutral": 1.0},
                "primary_emotion": "neutral",
                "model": "fallback",
                "method": "error_fallback"
            }
    
    def _get_fallback_analysis(self, audio_array: np.ndarray) -> Dict[str, Any]:
        """Fallback analysis when models fail"""
        # Simple energy-based emotion estimation
        energy = np.mean(audio_array ** 2)
        zcr = np.mean(np.abs(np.diff(np.sign(audio_array))))
        
        if energy < 0.001:
            emotion = "neutral"
            confidence = 0.8
        elif energy > 0.1 and zcr > 0.1:
            emotion = "angry"
            confidence = 0.6
        elif energy < 0.05 and zcr < 0.05:
            emotion = "sad"
            confidence = 0.7
        else:
            emotion = "neutral"
            confidence = 0.5
        
        return {
            "success": True,
            "emotion_scores": {emotion: confidence},
            "primary_emotion": emotion,
            "model": "energy_baseline",
            "method": "fallback"
        }
    
    def transcribe_audio(self, audio_array: np.ndarray, sample_rate: int = 16000) -> Dict[str, Any]:
        """Transcribe audio to text (optional)"""
        try:
            # You can integrate Whisper API here if needed
            # For now, return empty transcription
            return {
                "success": False,
                "transcription": None,
                "confidence": 0.0,
                "note": "Transcription service not configured"
            }
        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "transcription": None
            }
    
    def detect_risk_keywords(self, text: str) -> Tuple[List[str], str]:
        """Detect risk keywords in text"""
        if not text:
            return [], "LOW"
        
        text_lower = text.lower()
        found_keywords = []
        max_risk_level = "LOW"
        
        risk_order = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}
        
        for level, keywords in self.RISK_PATTERNS.items():
            for keyword in keywords:
                if keyword in text_lower:
                    found_keywords.append(f"{keyword} ({level})")
                    if risk_order[level] > risk_order[max_risk_level]:
                        max_risk_level = level
        
        return found_keywords, max_risk_level
    
    def map_emotion_to_risk(self, emotion: str, emotion_score: float) -> Tuple[str, float]:
        """Map detected emotion to risk level"""
        emotion_lower = emotion.lower()
        
        # Define emotion to risk mapping
        if emotion_lower in ["anger", "disgust", "fear", "sadness"]:
            base_risk = 70
            risk_level = "HIGH"
        elif emotion_lower in ["frustration", "anxiety", "stress"]:
            base_risk = 50
            risk_level = "MEDIUM"
        elif emotion_lower in ["neutral", "surprise"]:
            base_risk = 30
            risk_level = "LOW"
        elif emotion_lower in ["happy", "joy", "calm", "excited"]:
            base_risk = 10
            risk_level = "LOW"
        else:
            base_risk = 40
            risk_level = "LOW"
        
        # Adjust based on emotion confidence
        adjusted_risk = base_risk + ((1 - emotion_score) * 20)
        adjusted_risk = min(100, max(0, adjusted_risk))
        
        # Refine risk level based on score
        if adjusted_risk >= 80:
            risk_level = "CRITICAL"
        elif adjusted_risk >= 60:
            risk_level = "HIGH"
        elif adjusted_risk >= 40:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        return risk_level, float(round(adjusted_risk, 1))
    
    def get_recommendations(self, risk_level: str, primary_emotion: str) -> Dict[str, List[str]]:
        """Get recommendations based on risk level and emotion"""
        
        recommendations = {
            "LOW": {
                "immediate": [
                    "Practice deep breathing for 5 minutes",
                    "Take a short walk or stretch break",
                    "Listen to calming music",
                    "Drink a glass of water"
                ],
                "long_term": [
                    "Establish a daily mindfulness practice",
                    "Maintain regular sleep schedule",
                    "Engage in regular physical activity",
                    "Connect with supportive friends weekly"
                ]
            },
            "MEDIUM": {
                "immediate": [
                    "Practice grounding techniques (5-4-3-2-1 method)",
                    "Write down your thoughts in a journal",
                    "Call or text a trusted friend",
                    "Try progressive muscle relaxation"
                ],
                "long_term": [
                    "Consider talking to a counselor or therapist",
                    "Join a support group or online community",
                    "Learn stress management techniques",
                    "Establish healthy work-life boundaries"
                ]
            },
            "HIGH": {
                "immediate": [
                    "Contact a mental health helpline immediately",
                    "Practice the STOP technique (Stop, Take a breath, Observe, Proceed)",
                    "Remove yourself from stressful situations",
                    "Use crisis coping cards if available"
                ],
                "long_term": [
                    "Consult a mental health professional urgently",
                    "Develop a detailed safety plan with professional help",
                    "Regularly attend therapy sessions",
                    "Establish a strong support network"
                ]
            },
            "CRITICAL": {
                "immediate": [
                    "🚨 CALL A CRISIS HELPLINE IMMEDIATELY",
                    "🚨 Go to the nearest emergency department",
                    "🚨 Do not stay alone - be with someone you trust",
                    "🚨 Remove access to harmful means immediately"
                ],
                "long_term": [
                    "Immediate psychiatric evaluation needed",
                    "Regular follow-up with mental health team",
                    "Medication management if prescribed",
                    "Intensive outpatient or inpatient care as needed"
                ]
            }
        }
        
        # Emotion-specific additions
        emotion_specific = {
            "anger": [
                "Practice anger management techniques",
                "Use physical activity to release tension",
                "Try counting to 10 before responding"
            ],
            "anxiety": [
                "Practice box breathing technique",
                "Challenge anxious thoughts with evidence",
                "Limit caffeine and stimulant intake"
            ],
            "sadness": [
                "Engage in activities you used to enjoy",
                "Practice self-compassion exercises",
                "Create a small, achievable daily goal"
            ],
            "stress": [
                "Prioritize and delegate tasks",
                "Practice time management techniques",
                "Take regular breaks throughout the day"
            ]
        }
        
        base_recs = recommendations.get(risk_level, recommendations["MEDIUM"])
        
        # Add emotion-specific recommendations
        emotion_recs = emotion_specific.get(primary_emotion.lower(), [])
        if emotion_recs:
            base_recs["long_term"].extend(emotion_recs[:2])
        
        return base_recs
    
    def analyze_audio_file(self, audio_bytes: bytes, audio_format: str = "wav") -> Dict[str, Any]:
        """Main method to analyze audio file"""
        start_time = time.time()
        
        try:
            # Step 1: Process audio
            audio_array, sample_rate = self.audio_processor.load_and_preprocess(
                audio_bytes, 
                self.SAMPLE_RATE
            )
            
            duration = len(audio_array) / sample_rate
            
            # Step 2: Analyze emotion
            emotion_result = self.analyze_audio_emotion(audio_array, sample_rate)
            
            if not emotion_result["success"]:
                raise ValueError("Emotion analysis failed")
            
            # Step 3: Transcribe (optional)
            transcription_result = self.transcribe_audio(audio_array, sample_rate)
            
            # Step 4: Extract features
            features = self.audio_processor.extract_features(audio_array, sample_rate)
            
            # Step 5: Map to risk level
            primary_emotion = emotion_result["primary_emotion"]
            primary_score = emotion_result["emotion_scores"].get(primary_emotion, 0.5)
            
            risk_level, risk_score = self.map_emotion_to_risk(primary_emotion, primary_score)
            
            # Step 6: Detect keywords from transcription
            keywords, transcription_risk = self.detect_risk_keywords(
                transcription_result.get("transcription", "")
            )
            
            # Adjust risk based on transcription
            if transcription_risk in ["HIGH", "CRITICAL"] and risk_level in ["LOW", "MEDIUM"]:
                risk_level = "HIGH"
                risk_score = min(100, risk_score + 20)
            
            # Step 7: Get recommendations
            recommendations = self.get_recommendations(risk_level, primary_emotion)
            
            # Step 8: Calculate confidence
            confidence = min(0.95, primary_score * 0.8 + 0.2)
            
            # Step 9: Prepare warning flags
            warning_flags = []
            if risk_level in ["HIGH", "CRITICAL"]:
                warning_flags.append(f"High emotional distress detected ({primary_emotion})")
            
            if keywords:
                warning_flags.append(f"Risk indicators in speech: {len(keywords)} found")
            
            if duration < 2:
                warning_flags.append("Audio very short - analysis may be less accurate")
            
            # Step 10: Determine next step
            next_steps = {
                "LOW": "Continue with self-care practices. Regular emotional check-ins are helpful.",
                "MEDIUM": "Consider professional support. Early intervention can be very effective.",
                "HIGH": "Seek professional help soon. Your emotional well-being is important.",
                "CRITICAL": "🚨 SEEK IMMEDIATE PROFESSIONAL HELP. You don't have to face this alone."
            }
            
            # Prepare results
            results = {
                "success": True,
                "risk_level": risk_level,
                "risk_score": risk_score,
                "confidence": round(confidence, 2),
                "primary_emotion": primary_emotion,
                "emotion_scores": {k: round(v, 3) for k, v in emotion_result["emotion_scores"].items()},
                "detected_emotions": list(emotion_result["emotion_scores"].keys()),
                "audio_duration": round(duration, 2),
                "sample_rate": sample_rate,
                "format": audio_format,
                "transcription": transcription_result.get("transcription"),
                "transcription_confidence": transcription_result.get("confidence"),
                "keywords_found": keywords,
                "risk_indicators": warning_flags.copy(),
                "recommendations": recommendations["immediate"],
                "immediate_actions": recommendations["immediate"][:3],
                "long_term_strategies": recommendations["long_term"][:3],
                "next_step": next_steps.get(risk_level, ""),
                "warning_flags": warning_flags,
                "analysis_timestamp": datetime.now().isoformat(),
                "model_used": f"{emotion_result['model']} ({emotion_result['method']})",
                "processing_time": round(time.time() - start_time, 2),
                "audio_features": features,
                "context_notes": [
                    f"Audio duration: {duration:.1f}s",
                    f"Primary emotion: {primary_emotion} ({primary_score:.1%})",
                    f"Analysis method: {emotion_result['method']}"
                ]
            }
            
            return results
            
        except Exception as e:
            logger.error(f"Audio analysis failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": round(time.time() - start_time, 2),
                "fallback_analysis": self._get_minimal_analysis()
            }
    
    def _get_minimal_analysis(self) -> Dict[str, Any]:
        """Return minimal analysis when full analysis fails"""
        return {
            "risk_level": "LOW",
            "risk_score": 20.0,
            "confidence": 0.3,
            "primary_emotion": "neutral",
            "emotion_scores": {"neutral": 1.0},
            "detected_emotions": ["neutral"],
            "recommendations": [
                "The audio analysis encountered technical difficulties",
                "Please try recording again in a quiet environment",
                "Consider typing your feelings if audio analysis fails"
            ],
            "warning_flags": ["Technical analysis issue - results may be inaccurate"]
        }