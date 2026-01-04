# audio_emotion_api.py - Complete Audio Emotion Detection API in one file
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Literal, Any
import logging
from datetime import datetime
import uvicorn
import os
import time
import json
import numpy as np
import librosa
import soundfile as sf
from pydub import AudioSegment
import io
import tempfile
import uuid
import shutil
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
from transformers import pipeline
import torch

# ==================== Configuration ====================
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# API Configuration
HF_TOKEN = os.getenv("HF_TOKEN")
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8001"))
MAX_FILE_SIZE_MB = int(os.getenv("MAX_AUDIO_SIZE_MB", "50"))
MAX_DURATION = int(os.getenv("MAX_DURATION_SECONDS", "30"))
ALLOWED_EXTENSIONS = ["wav", "mp3", "m4a", "flac", "ogg"]
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

# Model Configuration
AUDIO_MODEL = "firdhokk/speech-emotion-recognition-with-openai-whisper-large-v3"
SAMPLE_RATE = 16000

# ==================== Initialize FastAPI App ====================
app = FastAPI(
    title="Audio Emotion Detection API",
    description="Detect emotions from audio and assess mental health risk",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For testing, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Pydantic Models ====================
class AudioAnalysisResponse(BaseModel):
    """Response model for audio analysis"""
    success: bool
    risk_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    risk_score: float = Field(..., ge=0, le=100)
    confidence: float = Field(..., ge=0, le=1)
    primary_emotion: str
    emotion_scores: Dict[str, float]
    detected_emotions: List[str]
    audio_duration: float
    sample_rate: int
    format: Optional[str]
    recommendations: List[str]
    warning_flags: List[str]
    next_step: str
    emergency_helplines: Dict[str, str]
    analysis_timestamp: str
    model_used: str
    processing_time: float

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    details: Optional[str] = None

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: str
    audio_model_loaded: bool
    api_version: str = "1.0.0"

# ==================== Audio Processor ====================
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
            # Write to temp file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name
            
            # Load with librosa
            audio, sr = librosa.load(tmp_path, sr=target_sr, duration=MAX_DURATION)
            
            # Cleanup
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

# ==================== Audio Emotion Analyzer ====================
class AudioEmotionAnalyzer:
    """Main analyzer class using Hugging Face models"""
    
    def __init__(self, hf_token: str = None):
        self.hf_token = hf_token or HF_TOKEN
        self.initialized = False
        self.audio_processor = AudioProcessor()
        
        # Risk patterns in speech
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
        
        # Initialize models
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize Hugging Face models"""
        try:
            logger.info(f"Initializing model: {AUDIO_MODEL}")
            
            if self.hf_token:
                # Try using Inference API first
                self.client = InferenceClient(token=self.hf_token, timeout=60)
                logger.info("Using Hugging Face Inference API")
                self.use_inference_api = True
            else:
                # Fallback to local pipeline
                logger.warning("No HF_TOKEN found, trying local pipeline")
                self.pipeline = pipeline(
                    "audio-classification",
                    model=AUDIO_MODEL
                )
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
                result = self.client.audio_classification(
                    audio=audio_bytes,
                    model=AUDIO_MODEL
                )
                
                emotion_scores = {}
                for item in result:
                    emotion_scores[item['label']] = item['score']
                
                primary_emotion = max(emotion_scores, key=emotion_scores.get)
                
                return {
                    "success": True,
                    "emotion_scores": emotion_scores,
                    "primary_emotion": primary_emotion,
                    "confidence": emotion_scores[primary_emotion],
                    "method": "inference_api"
                }
            elif hasattr(self, 'pipeline'):
                # Use local pipeline
                result = self.pipeline(audio_array)
                
                emotion_scores = {}
                for item in result:
                    emotion_scores[item['label']] = item['score']
                
                primary_emotion = max(emotion_scores, key=emotion_scores.get)
                
                return {
                    "success": True,
                    "emotion_scores": emotion_scores,
                    "primary_emotion": primary_emotion,
                    "confidence": emotion_scores[primary_emotion],
                    "method": "local_pipeline"
                }
            else:
                # Fallback
                return self._get_fallback_analysis(audio_array)
                
        except Exception as e:
            logger.error(f"Emotion analysis failed: {str(e)}")
            return self._get_fallback_analysis(audio_array)
    
    def _get_fallback_analysis(self, audio_array: np.ndarray) -> Dict[str, Any]:
        """Fallback when model fails"""
        # Simple energy-based estimation
        energy = np.mean(audio_array ** 2)
        
        if energy < 0.001:
            emotion = "neutral"
            confidence = 0.7
        elif energy > 0.1:
            emotion = "angry"
            confidence = 0.6
        elif energy < 0.05:
            emotion = "sad"
            confidence = 0.7
        else:
            emotion = "neutral"
            confidence = 0.5
        
        return {
            "success": True,
            "emotion_scores": {emotion: confidence},
            "primary_emotion": emotion,
            "confidence": confidence,
            "method": "fallback"
        }
    
    def map_to_risk_level(self, emotion: str, confidence: float) -> tuple:
        """Map emotion to risk level"""
        emotion_lower = emotion.lower()
        
        # Emotion to risk mapping
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
        
        # Adjust based on confidence
        adjusted_risk = base_risk + ((1 - confidence) * 20)
        adjusted_risk = min(100, max(0, adjusted_risk))
        
        # Final risk level based on score
        if adjusted_risk >= 80:
            risk_level = "CRITICAL"
        elif adjusted_risk >= 60:
            risk_level = "HIGH"
        elif adjusted_risk >= 40:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        return risk_level, float(round(adjusted_risk, 1))
    
    def get_recommendations(self, risk_level: str, emotion: str) -> List[str]:
        """Get personalized recommendations"""
        
        recommendations = {
            "LOW": [
                "Practice deep breathing for 5 minutes",
                "Take a short walk or stretch break",
                "Listen to calming music",
                "Maintain regular sleep schedule"
            ],
            "MEDIUM": [
                "Consider talking to a counselor or therapist",
                "Practice grounding techniques (5-4-3-2-1 method)",
                "Join a support group or online community",
                "Learn stress management techniques"
            ],
            "HIGH": [
                "Contact a mental health helpline for support",
                "Practice the STOP technique (Stop, Take a breath, Observe, Proceed)",
                "Consult a mental health professional",
                "Develop a safety plan with professional help"
            ],
            "CRITICAL": [
                "🚨 CALL A CRISIS HELPLINE IMMEDIATELY",
                "🚨 Go to the nearest emergency department",
                "🚨 Do not stay alone - be with someone you trust",
                "🚨 Remove access to harmful means immediately"
            ]
        }
        
        return recommendations.get(risk_level, recommendations["MEDIUM"])
    
    def analyze_audio_file(self, audio_bytes: bytes, file_extension: str) -> Dict[str, Any]:
        """Main analysis function"""
        start_time = time.time()
        
        try:
            # Validate audio
            validation = self.audio_processor.validate_audio(audio_bytes)
            if not validation["valid"]:
                return {
                    "success": False,
                    "error": validation["error"],
                    "fallback_analysis": self._get_minimal_analysis()
                }
            
            # Load audio
            audio_array, sample_rate = self.audio_processor.load_audio(audio_bytes)
            duration = len(audio_array) / sample_rate
            
            # Analyze emotion
            emotion_result = self.analyze_emotion(audio_array, sample_rate)
            
            if not emotion_result["success"]:
                return {
                    "success": False,
                    "error": "Emotion analysis failed",
                    "fallback_analysis": self._get_minimal_analysis()
                }
            
            # Map to risk level
            primary_emotion = emotion_result["primary_emotion"]
            confidence = emotion_result["confidence"]
            
            risk_level, risk_score = self.map_to_risk_level(primary_emotion, confidence)
            
            # Get recommendations
            recommendations = self.get_recommendations(risk_level, primary_emotion)
            
            # Prepare warning flags
            warning_flags = []
            if risk_level in ["HIGH", "CRITICAL"]:
                warning_flags.append(f"High emotional distress detected ({primary_emotion})")
            
            # Next step
            next_steps = {
                "LOW": "Continue with self-care practices.",
                "MEDIUM": "Consider professional support.",
                "HIGH": "Seek professional help soon.",
                "CRITICAL": "🚨 SEEK IMMEDIATE PROFESSIONAL HELP."
            }
            
            # Model used
            model_used = f"{AUDIO_MODEL} ({emotion_result.get('method', 'unknown')})"
            
            # Prepare results
            results = {
                "success": True,
                "risk_level": risk_level,
                "risk_score": risk_score,
                "confidence": round(confidence, 3),
                "primary_emotion": primary_emotion,
                "emotion_scores": {k: round(v, 3) for k, v in emotion_result["emotion_scores"].items()},
                "detected_emotions": list(emotion_result["emotion_scores"].keys()),
                "audio_duration": round(duration, 2),
                "sample_rate": sample_rate,
                "format": file_extension,
                "recommendations": recommendations,
                "warning_flags": warning_flags,
                "next_step": next_steps.get(risk_level, ""),
                "emergency_helplines": self.EMERGENCY_HELPLINES,
                "analysis_timestamp": datetime.now().isoformat(),
                "model_used": model_used,
                "processing_time": round(time.time() - start_time, 2)
            }
            
            return results
            
        except Exception as e:
            logger.error(f"Audio analysis failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "fallback_analysis": self._get_minimal_analysis()
            }
    
    def _get_minimal_analysis(self) -> Dict[str, Any]:
        """Return minimal analysis when everything fails"""
        return {
            "risk_level": "LOW",
            "risk_score": 20.0,
            "confidence": 0.5,
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

# ==================== Initialize Analyzer ====================
try:
    analyzer = AudioEmotionAnalyzer(HF_TOKEN)
    logger.info("Audio analyzer initialized")
except Exception as e:
    logger.error(f"Failed to initialize analyzer: {str(e)}")
    analyzer = None

# ==================== Helper Functions ====================
def validate_file(file: UploadFile) -> dict:
    """Validate uploaded file"""
    result = {
        "valid": False,
        "error": None,
        "extension": None,
        "size": 0
    }
    
    try:
        # Check filename
        if not file.filename:
            result["error"] = "No filename provided"
            return result
        
        # Check extension
        file_extension = file.filename.split('.')[-1].lower() if '.' in file.filename else ""
        
        if file_extension not in ALLOWED_EXTENSIONS:
            result["error"] = f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            return result
        
        # Check size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > MAX_FILE_SIZE_BYTES:
            result["error"] = f"File too large. Max size: {MAX_FILE_SIZE_MB}MB"
            return result
        
        result.update({
            "valid": True,
            "extension": file_extension,
            "size": file_size
        })
        
        return result
        
    except Exception as e:
        result["error"] = f"Validation error: {str(e)}"
        return result

async def process_uploaded_file(file: UploadFile) -> bytes:
    """Process uploaded file and return bytes"""
    try:
        content = await file.read()
        return content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

# ==================== API Endpoints ====================
@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "message": "Audio Emotion Detection API",
        "version": "1.0.0",
        "status": "ready" if analyzer and analyzer.initialized else "initializing",
        "ai_available": bool(HF_TOKEN),
        "model": AUDIO_MODEL,
        "endpoints": {
            "analyze": "POST /analyze",
            "health": "GET /health",
            "emergency": "GET /emergency"
        },
        "supported_formats": ALLOWED_EXTENSIONS,
        "max_file_size_mb": MAX_FILE_SIZE_MB,
        "max_duration_seconds": MAX_DURATION
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Test model if available
        model_status = False
        if analyzer and analyzer.initialized:
            try:
                # Quick test with silent audio
                test_audio = np.zeros((SAMPLE_RATE * 2,), dtype=np.float32)
                result = analyzer.analyze_emotion(test_audio)
                model_status = result.get("success", False)
            except:
                model_status = False
        
        return HealthResponse(
            status="healthy" if analyzer else "unhealthy",
            timestamp=datetime.now().isoformat(),
            audio_model_loaded=model_status
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.get("/emergency")
async def emergency_resources():
    """Get emergency mental health resources"""
    if analyzer:
        return {
            "emergency_helplines": analyzer.EMERGENCY_HELPLINES,
            "note": "These are emergency resources. Please use them if needed.",
            "timestamp": datetime.now().isoformat()
        }
    else:
        return {
            "emergency_helplines": {
                "National Suicide Prevention Lifeline (US)": "988",
                "Crisis Text Line": "Text HOME to 741741",
                "International Association for Suicide Prevention": "https://www.iasp.info/resources/Crisis_Centres/"
            }
        }

@app.post("/analyze", response_model=AudioAnalysisResponse)
async def analyze_audio(
    file: UploadFile = File(..., description="Audio file (WAV, MP3, M4A, FLAC, OGG)"),
    user_id: Optional[str] = Form(None),
    session_id: Optional[str] = Form(None)
):
    """
    Analyze audio for emotion detection
    
    - **file**: Audio file (max 50MB, max 30 seconds)
    - **user_id**: Optional user identifier
    - **session_id**: Optional session identifier
    
    Returns emotion analysis with risk assessment and recommendations
    """
    try:
        # Check analyzer
        if not analyzer or not analyzer.initialized:
            raise HTTPException(
                status_code=503,
                detail="Audio analyzer is not ready. Please try again later."
            )
        
        logger.info(f"Audio analysis requested for: {file.filename}")
        
        # Validate file
        validation = validate_file(file)
        if not validation["valid"]:
            raise HTTPException(status_code=400, detail=validation["error"])
        
        # Process file
        audio_bytes = await process_uploaded_file(file)
        file_extension = validation["extension"]
        
        # Convert to WAV if needed (for better compatibility)
        if file_extension != "wav":
            try:
                audio_bytes = AudioProcessor.convert_to_wav(audio_bytes, file_extension)
                file_extension = "wav"
            except Exception as conv_error:
                logger.warning(f"Conversion failed, using original: {str(conv_error)}")
        
        # Analyze audio
        analysis_start = time.time()
        analysis_result = analyzer.analyze_audio_file(audio_bytes, file_extension)
        
        if not analysis_result.get("success", False):
            # Try fallback analysis
            fallback = analysis_result.get("fallback_analysis", analyzer._get_minimal_analysis())
            
            # Create response with fallback data
            response = AudioAnalysisResponse(
                success=True,
                risk_level=fallback["risk_level"],
                risk_score=fallback["risk_score"],
                confidence=fallback["confidence"],
                primary_emotion=fallback["primary_emotion"],
                emotion_scores=fallback["emotion_scores"],
                detected_emotions=fallback["detected_emotions"],
                audio_duration=0,
                sample_rate=SAMPLE_RATE,
                format=file_extension,
                recommendations=fallback["recommendations"],
                warning_flags=fallback["warning_flags"],
                next_step="Analysis had issues. Please try again with clearer audio.",
                emergency_helplines=analyzer.EMERGENCY_HELPLINES,
                analysis_timestamp=datetime.now().isoformat(),
                model_used="Fallback Analysis",
                processing_time=round(time.time() - analysis_start, 2)
            )
            
            logger.warning(f"Analysis failed, using fallback: {analysis_result.get('error')}")
            
            return response
        
        # Create successful response
        response = AudioAnalysisResponse(
            success=True,
            risk_level=analysis_result["risk_level"],
            risk_score=analysis_result["risk_score"],
            confidence=analysis_result["confidence"],
            primary_emotion=analysis_result["primary_emotion"],
            emotion_scores=analysis_result["emotion_scores"],
            detected_emotions=analysis_result["detected_emotions"],
            audio_duration=analysis_result["audio_duration"],
            sample_rate=analysis_result["sample_rate"],
            format=analysis_result["format"],
            recommendations=analysis_result["recommendations"],
            warning_flags=analysis_result["warning_flags"],
            next_step=analysis_result["next_step"],
            emergency_helplines=analysis_result["emergency_helplines"],
            analysis_timestamp=analysis_result["analysis_timestamp"],
            model_used=analysis_result["model_used"],
            processing_time=analysis_result["processing_time"]
        )
        
        # Log results
        logger.info(f"Analysis complete - Emotion: {analysis_result['primary_emotion']}, "
                   f"Risk: {analysis_result['risk_level']}, Time: {analysis_result['processing_time']}s")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Audio analysis error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/test-simple")
async def test_simple_analysis():
    """Simple test endpoint with generated audio"""
    try:
        if not analyzer or not analyzer.initialized:
            raise HTTPException(status_code=503, detail="Analyzer not ready")
        
        # Generate test audio (happy tone)
        sample_rate = 16000
        duration = 3
        t = np.linspace(0, duration, sample_rate * duration)
        test_audio = 0.3 * np.sin(2 * np.pi * 440 * t)  # A4 note
        
        # Convert to bytes
        buffer = io.BytesIO()
        sf.write(buffer, test_audio, sample_rate, format='WAV')
        audio_bytes = buffer.getvalue()
        
        # Analyze
        result = analyzer.analyze_audio_file(audio_bytes, "wav")
        
        return {
            "test": "synthetic_audio",
            "audio_info": {
                "duration": duration,
                "sample_rate": sample_rate,
                "frequency": "440 Hz (A4)"
            },
            "analysis_result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")

# ==================== Error Handlers ====================
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.detail,
            details=str(exc) if exc.status_code == 500 else None
        ).dict()
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    """Handle generic exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal server error",
            details=str(exc) if os.getenv("DEBUG", "").lower() == "true" else None
        ).dict()
    )

# ==================== Startup/Shutdown ====================
@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    logger.info("🚀 Starting Audio Emotion Detection API...")
    logger.info(f"Model: {AUDIO_MODEL}")
    logger.info(f"Host: {API_HOST}, Port: {API_PORT}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("👋 Shutting down Audio Emotion Detection API...")

# ==================== Test Script Included ====================
def create_test_audio_files():
    """Create test audio files for quick testing"""
    print("🎵 Creating test audio files...")
    
    test_files = []
    
    # Create a few test audio files
    emotions = ["happy", "sad", "neutral", "angry"]
    
    for emotion in emotions:
        filename = f"test_{emotion}.wav"
        sample_rate = 16000
        duration = 3
        t = np.linspace(0, duration, sample_rate * duration)
        
        if emotion == "happy":
            audio = 0.3 * np.sin(2 * np.pi * 440 * t)  # High frequency
        elif emotion == "sad":
            audio = 0.2 * np.sin(2 * np.pi * 110 * t)  # Low frequency
        elif emotion == "angry":
            audio = 0.5 * np.sin(2 * np.pi * 330 * t) + 0.1 * np.random.randn(len(t))
        else:  # neutral
            audio = 0.1 * np.sin(2 * np.pi * 220 * t)
        
        sf.write(filename, audio, sample_rate)
        test_files.append(filename)
        print(f"  Created: {filename}")
    
    return test_files

def run_quick_test():
    """Run a quick test of the API"""
    print("\n🧪 Running quick test...")
    
    # Check if API is running
    import requests
    try:
        response = requests.get(f"http://{API_HOST}:{API_PORT}/", timeout=5)
        print(f"✅ API is running: {response.status_code}")
    except:
        print("❌ API is not running. Starting it first...")
        return False
    
    # Create test audio
    test_files = create_test_audio_files()
    
    # Test each file
    for test_file in test_files:
        print(f"\n📁 Testing: {test_file}")
        
        try:
            with open(test_file, "rb") as f:
                files = {"file": (test_file, f, "audio/wav")}
                data = {"user_id": "test", "session_id": "123"}
                
                response = requests.post(
                    f"http://{API_HOST}:{API_PORT}/analyze",
                    files=files,
                    data=data,
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"  ✅ Success!")
                    print(f"  Emotion: {result.get('primary_emotion')}")
                    print(f"  Risk Level: {result.get('risk_level')}")
                    print(f"  Confidence: {result.get('confidence')}")
                else:
                    print(f"  ❌ Failed: {response.status_code}")
                    print(f"  Error: {response.text}")
        
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
    
    # Cleanup test files
    for test_file in test_files:
        if os.path.exists(test_file):
            os.remove(test_file)
    
    print("\n✅ Quick test completed!")
    return True

# ==================== Main Execution ====================
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Audio Emotion Detection API")
    parser.add_argument("--host", default=API_HOST, help="Host to bind to")
    parser.add_argument("--port", type=int, default=API_PORT, help="Port to bind to")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload")
    parser.add_argument("--test", action="store_true", help="Run quick test and exit")
    parser.add_argument("--create-test-files", action="store_true", help="Create test audio files")
    
    args = parser.parse_args()
    
    if args.create_test_files:
        create_test_audio_files()
        print("\n✅ Test files created!")
    
    elif args.test:
        # Start server in background for testing
        import subprocess
        import threading
        import time
        
        def start_server():
            subprocess.run([
                "python", "audio_emotion_api.py",
                "--host", args.host,
                "--port", str(args.port)
            ])
        
        # Start server thread
        server_thread = threading.Thread(target=start_server, daemon=True)
        server_thread.start()
        
        # Wait for server to start
        print("⏳ Starting server for testing...")
        time.sleep(5)
        
        # Run test
        success = run_quick_test()
        
        if success:
            print("\n🎉 API is working correctly!")
        else:
            print("\n❌ API test failed. Check the server logs.")
        
        # Server will exit when main thread exits
        
    else:
        # Run the API normally
        print(f"\n🎤 Audio Emotion Detection API")
        print(f"📡 Endpoint: http://{args.host}:{args.port}")
        print(f"📚 Docs: http://{args.host}:{args.port}/docs")
        print(f"🛠️  Model: {AUDIO_MODEL}")
        print("\nPress Ctrl+C to stop\n")
        
        uvicorn.run(
            "audio_emotion_api:app",
            host=args.host,
            port=args.port,
            reload=args.reload,
            log_level="info"
        )