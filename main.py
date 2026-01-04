# main.py - Audio Emotion Detection API with Hugging Face
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import local modules
from models.schemas import (
    AudioAnalysisRequest,
    AudioAnalysisResponse,
    ErrorResponse,
    HealthCheckResponse,
    ModelInfoResponse,
    MentalHealthResources
)
from audio_analyzer import AudioEmotionAnalyzer
from utils.file_handling import FileHandler
from utils.audio_processing import AudioProcessor

# Initialize FastAPI app
app = FastAPI(
    title="Audio Emotion Detection API",
    description="AI-powered audio emotion analysis with risk scoring and mental health recommendations",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://mannkibaat-rehab.vercel.app",
        "http://localhost:8001",
        "*"  # For development only
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Configuration ====================
HF_TOKEN = os.getenv("HF_TOKEN")
MAX_FILE_SIZE_MB = int(os.getenv("MAX_AUDIO_SIZE_MB", 50))
ALLOWED_EXTENSIONS = os.getenv("ALLOWED_AUDIO_EXTENSIONS", "wav,mp3,m4a,flac,ogg").split(",")
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

# ==================== Initialize Components ====================
try:
    analyzer = AudioEmotionAnalyzer(hf_token=HF_TOKEN)
    file_handler = FileHandler()
    audio_processor = AudioProcessor()
    
    logger.info("API components initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize components: {str(e)}")
    analyzer = None

# ==================== Helper Functions ====================
def validate_audio_file(file: UploadFile) -> Dict[str, Any]:
    """Validate uploaded audio file"""
    validation_result = {
        "valid": False,
        "error": None,
        "extension": None,
        "size": 0
    }
    
    try:
        # Check file extension
        filename = file.filename
        if not filename:
            validation_result["error"] = "No filename provided"
            return validation_result
        
        file_extension = filename.split('.')[-1].lower() if '.' in filename else ""
        
        if file_extension not in ALLOWED_EXTENSIONS:
            validation_result["error"] = f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            return validation_result
        
        # Get file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > MAX_FILE_SIZE_BYTES:
            validation_result["error"] = f"File too large. Max size: {MAX_FILE_SIZE_MB}MB"
            return validation_result
        
        validation_result.update({
            "valid": True,
            "extension": file_extension,
            "size": file_size
        })
        
        return validation_result
        
    except Exception as e:
        validation_result["error"] = f"Validation error: {str(e)}"
        return validation_result

async def process_uploaded_file(file: UploadFile) -> tuple[bytes, str, str]:
    """Process uploaded file and return bytes, extension, and filename"""
    try:
        # Read file content
        content = await file.read()
        
        # Get file info
        file_extension = file.filename.split('.')[-1].lower() if '.' in file.filename else ""
        filename = file.filename
        
        return content, file_extension, filename
        
    except Exception as e:
        logger.error(f"Failed to process uploaded file: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process uploaded file")

def cleanup_background(filepath: str):
    """Background task to cleanup files"""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            logger.info(f"Background cleanup completed for: {filepath}")
    except Exception as e:
        logger.error(f"Background cleanup failed: {str(e)}")

# ==================== API Endpoints ====================
@app.get("/", response_model=Dict[str, Any])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Audio Emotion Detection API",
        "version": "1.0.0",
        "status": "ready" if analyzer and analyzer.initialized else "initializing",
        "ai_available": bool(HF_TOKEN),
        "features": [
            "AI-powered audio emotion detection",
            "Risk level assessment based on emotions",
            "Personalized mental health recommendations",
            "Multi-format audio support",
            "Real-time processing"
        ],
        "supported_formats": ALLOWED_EXTENSIONS,
        "max_file_size_mb": MAX_FILE_SIZE_MB,
        "endpoints": {
            "analyze": "POST /analyze",
            "health": "GET /health",
            "models": "GET /models",
            "resources": "GET /resources"
        }
    }

@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Check analyzer status
        audio_status = "active" if analyzer and analyzer.initialized else "inactive"
        
        # Test model with a small audio sample
        transcription_status = "unknown"
        if analyzer and analyzer.initialized:
            try:
                # Test with silent audio
                import numpy as np
                test_audio = np.zeros((16000,), dtype=np.float32)
                result = analyzer.analyze_audio_emotion(test_audio)
                transcription_status = "working" if result["success"] else "failed"
            except Exception as e:
                transcription_status = f"error: {str(e)}"
        
        return HealthCheckResponse(
            status="healthy",
            timestamp=datetime.now().isoformat(),
            audio_model_status=audio_status,
            transcription_status=transcription_status,
            models_loaded=[analyzer.AUDIO_MODEL] if analyzer else [],
            memory_usage="OK"
        )
        
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.get("/models", response_model=ModelInfoResponse)
async def get_models():
    """Get information about the AI models being used"""
    if not analyzer:
        raise HTTPException(status_code=503, detail="Analyzer not initialized")
    
    return ModelInfoResponse(
        audio_emotion_model=analyzer.AUDIO_MODEL,
        transcription_model="Whisper (via Hugging Face)",
        sample_rate=analyzer.SAMPLE_RATE,
        max_duration=analyzer.MAX_DURATION,
        supported_formats=ALLOWED_EXTENSIONS,
        status="active" if analyzer.initialized else "inactive",
        description="Advanced AI model for audio emotion recognition with risk assessment capabilities"
    )

@app.get("/resources", response_model=Dict[str, Any])
async def get_resources():
    """Get mental health resources"""
    if not analyzer:
        raise HTTPException(status_code=503, detail="Analyzer not initialized")
    
    return {
        "status": "Mental health resources",
        "last_updated": datetime.now().strftime("%Y-%m-%d"),
        "resources": analyzer.MENTAL_HEALTH_RESOURCES,
        "note": "Emergency and support resources. Use when needed.",
        "disclaimer": "These are support resources, not a substitute for professional medical advice."
    }

@app.post("/analyze", response_model=AudioAnalysisResponse)
async def analyze_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Audio file to analyze"),
    user_id: Optional[str] = Form(None),
    session_id: Optional[str] = Form(None),
    language: Optional[str] = Form("english"),
    metadata: Optional[str] = Form(None)
):
    """
    Analyze audio for emotion detection and risk assessment
    
    - **file**: Audio file (WAV, MP3, M4A, FLAC, OGG) up to 50MB
    - **user_id**: Optional user identifier
    - **session_id**: Optional session identifier
    - **language**: Language context for analysis
    - **metadata**: Optional JSON metadata
    
    Returns detailed emotion analysis with mental health recommendations
    """
    try:
        # Check if analyzer is ready
        if not analyzer or not analyzer.initialized:
            raise HTTPException(
                status_code=503,
                detail="Audio analyzer is not ready. Please try again later."
            )
        
        logger.info(f"Starting audio analysis for file: {file.filename}")
        logger.info(f"User: {user_id}, Session: {session_id}, Language: {language}")
        
        # Validate file
        validation = validate_audio_file(file)
        if not validation["valid"]:
            raise HTTPException(
                status_code=400,
                detail=validation["error"]
            )
        
        # Process uploaded file
        audio_bytes, file_extension, filename = await process_uploaded_file(file)
        
        # Save file temporarily for processing
        temp_path = file_handler.save_temp_file(audio_bytes, f".{file_extension}")
        
        # Schedule cleanup
        background_tasks.add_task(cleanup_background, temp_path)
        
        # Convert to WAV if needed
        if file_extension != "wav":
            logger.info(f"Converting {file_extension} to WAV format")
            try:
                audio_bytes = audio_processor.convert_to_wav(audio_bytes, file_extension)
                file_extension = "wav"
            except Exception as conv_error:
                logger.warning(f"Conversion failed, using original: {str(conv_error)}")
        
        # Validate audio duration
        if not audio_processor.validate_audio_duration(audio_bytes, analyzer.MAX_DURATION):
            raise HTTPException(
                status_code=400,
                detail=f"Audio too long. Maximum duration: {analyzer.MAX_DURATION} seconds"
            )
        
        # Get audio information
        audio_info = audio_processor.get_audio_info(audio_bytes)
        
        # Perform analysis
        analysis_start = datetime.now()
        analysis_result = analyzer.analyze_audio_file(audio_bytes, file_extension)
        
        if not analysis_result.get("success", False):
            raise HTTPException(
                status_code=500,
                detail=f"Analysis failed: {analysis_result.get('error', 'Unknown error')}"
            )
        
        # Calculate processing time
        processing_time = (datetime.now() - analysis_start).total_seconds()
        
        # Create mental health resources object
        mental_health_resources = MentalHealthResources(
            emergency_helplines=analyzer.MENTAL_HEALTH_RESOURCES["emergency_helplines"],
            telemedicine_services=analyzer.MENTAL_HEALTH_RESOURCES["telemedicine_services"],
            government_resources=analyzer.MENTAL_HEALTH_RESOURCES["government_resources"],
            regional_support=analyzer.MENTAL_HEALTH_RESOURCES["regional_support"]
        )
        
        # Prepare context notes
        context_notes = analysis_result.get("context_notes", [])
        context_notes.extend([
            f"File format: {file_extension.upper()}",
            f"Processing time: {processing_time:.2f}s",
            f"Language context: {language}",
            f"API version: 1.0.0"
        ])
        
        if metadata:
            try:
                meta_dict = json.loads(metadata)
                context_notes.append(f"Metadata: {json.dumps(meta_dict)[:100]}...")
            except:
                context_notes.append("Metadata: Invalid JSON")
        
        # Create response
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
            transcription=analysis_result.get("transcription"),
            transcription_confidence=analysis_result.get("transcription_confidence"),
            keywords_found=analysis_result["keywords_found"],
            risk_indicators=analysis_result["risk_indicators"],
            recommendations=analysis_result["recommendations"],
            immediate_actions=analysis_result["immediate_actions"],
            long_term_strategies=analysis_result["long_term_strategies"],
            next_step=analysis_result["next_step"],
            warning_flags=analysis_result["warning_flags"],
            mental_health_resources=mental_health_resources,
            analysis_timestamp=analysis_result["analysis_timestamp"],
            session_id=session_id,
            model_used=analysis_result["model_used"],
            processing_time=analysis_result["processing_time"],
            context_notes=context_notes,
            file_size=validation["size"],
            file_name=filename
        )
        
        logger.info(f"Analysis complete - Risk: {analysis_result['risk_level']} "
                   f"({analysis_result['risk_score']}), Emotion: {analysis_result['primary_emotion']}")
        logger.info(f"Processing time: {processing_time:.2f}s")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Audio analysis error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

@app.post("/analyze-batch", response_model=Dict[str, Any])
async def analyze_batch_audio(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(..., description="Multiple audio files for batch analysis")
):
    """
    Analyze multiple audio files in batch
    
    - **files**: List of audio files (max 5 files, 50MB each)
    
    Returns batch analysis results
    """
    try:
        if not analyzer or not analyzer.initialized:
            raise HTTPException(status_code=503, detail="Analyzer not initialized")
        
        # Limit batch size
        if len(files) > 5:
            raise HTTPException(status_code=400, detail="Maximum 5 files per batch")
        
        results = []
        errors = []
        
        for file in files:
            try:
                # Validate file
                validation = validate_audio_file(file)
                if not validation["valid"]:
                    errors.append({
                        "filename": file.filename,
                        "error": validation["error"]
                    })
                    continue
                
                # Process file
                audio_bytes, file_extension, filename = await process_uploaded_file(file)
                
                # Convert to WAV if needed
                if file_extension != "wav":
                    try:
                        audio_bytes = audio_processor.convert_to_wav(audio_bytes, file_extension)
                        file_extension = "wav"
                    except Exception:
                        pass  # Continue with original format
                
                # Analyze
                analysis_result = analyzer.analyze_audio_file(audio_bytes, file_extension)
                
                if analysis_result.get("success"):
                    results.append({
                        "filename": filename,
                        "success": True,
                        "risk_level": analysis_result["risk_level"],
                        "risk_score": analysis_result["risk_score"],
                        "primary_emotion": analysis_result["primary_emotion"],
                        "duration": analysis_result["audio_duration"]
                    })
                else:
                    errors.append({
                        "filename": filename,
                        "error": analysis_result.get("error", "Analysis failed")
                    })
                    
            except Exception as file_error:
                errors.append({
                    "filename": file.filename,
                    "error": str(file_error)
                })
        
        return {
            "batch_id": str(datetime.now().timestamp()),
            "total_files": len(files),
            "successful": len(results),
            "failed": len(errors),
            "results": results,
            "errors": errors,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

@app.post("/test-audio", response_model=Dict[str, Any])
async def test_audio_analysis():
    """Test endpoint with synthetic audio"""
    try:
        if not analyzer or not analyzer.initialized:
            raise HTTPException(status_code=503, detail="Analyzer not initialized")
        
        # Generate test audio (sine wave)
        import numpy as np
        
        sample_rate = 16000
        duration = 3
        t = np.linspace(0, duration, int(sample_rate * duration))
        
        # Create a simple tone
        test_audio = 0.5 * np.sin(2 * np.pi * 440 * t)  # 440 Hz tone
        
        # Convert to bytes
        import io
        import soundfile as sf
        
        buffer = io.BytesIO()
        sf.write(buffer, test_audio, sample_rate, format='WAV')
        audio_bytes = buffer.getvalue()
        
        # Analyze
        result = analyzer.analyze_audio_file(audio_bytes, "wav")
        
        return {
            "test": "synthetic_audio",
            "duration": duration,
            "sample_rate": sample_rate,
            "analysis_result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Test audio error: {str(e)}")
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
            details=str(exc)
        ).dict()
    )

# ==================== Startup and Shutdown ====================
@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    logger.info("Starting Audio Emotion Detection API...")
    
    # Clean up old temp files
    try:
        file_handler.cleanup_old_files("temp", 1)
        file_handler.cleanup_old_files("uploads", 24)
    except Exception as e:
        logger.warning(f"Cleanup failed on startup: {str(e)}")
    
    logger.info("Audio Emotion Detection API started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Audio Emotion Detection API...")
    
    # Clean up temp files
    try:
        file_handler.cleanup_old_files("temp", 0)
    except Exception as e:
        logger.warning(f"Cleanup failed on shutdown: {str(e)}")
    
    logger.info("Audio Emotion Detection API shutdown complete")

# ==================== Main Execution ====================
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Audio Emotion Detection API")
    parser.add_argument("--host", default=os.getenv("API_HOST", "0.0.0.0"), help="Host to bind to")
    parser.add_argument("--port", type=int, default=int(os.getenv("API_PORT", 8001)), help="Port to bind to")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload")
    parser.add_argument("--test", action="store_true", help="Run tests and exit")
    
    args = parser.parse_args()
    
    if args.test:
        print("Running tests...")
        print(f"HF Token Available: {bool(HF_TOKEN)}")
        print(f"Analyzer Initialized: {analyzer and analyzer.initialized}")
        print(f"Model: {analyzer.AUDIO_MODEL if analyzer else 'N/A'}")
        print(f"Sample Rate: {analyzer.SAMPLE_RATE if analyzer else 'N/A'}")
        print(f"Allowed Extensions: {ALLOWED_EXTENSIONS}")
        print(f"Max File Size: {MAX_FILE_SIZE_MB}MB")
    else:
        uvicorn.run(
            "main:app",
            host=args.host,
            port=args.port,
            reload=args.reload,
            log_level="info",
            access_log=True
        )