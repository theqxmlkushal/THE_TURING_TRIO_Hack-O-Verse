# main.py - Integrated Mental Health Analysis API
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Literal
import logging
from datetime import datetime
import uvicorn
import os
from dotenv import load_dotenv

# Import analyzers
from text_analyzer import TextSentimentAnalyzer, TextAnalysisRequest, TextAnalysisResponse
from video_analyzer import VideoEmotionDetector
from audio_analyzer import AudioEmotionAnalyzer
from gemini_integrator import GeminiIntegrator

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Integrated Mental Health Analysis API",
    description="Unified API for text, audio, and video-based mental health analysis with AI recommendations",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global analyzer instances
text_analyzer = None
video_analyzer = None
audio_analyzer = None
gemini_integrator = None

# ==================== Pydantic Models ====================
class CombinedAnalysisRequest(BaseModel):
    """Request for combined analysis"""
    text: Optional[str] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None

class CombinedAnalysisResponse(BaseModel):
    """Response for combined analysis"""
    model_config = ConfigDict(protected_namespaces=())
    
    overall_risk_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    overall_risk_score: float
    overall_confidence: float
    
    text_analysis: Optional[Dict] = None
    audio_analysis: Optional[Dict] = None
    video_analysis: Optional[Dict] = None
    
    combined_emotions: List[str]
    ai_recommendations: List[str]
    personalized_advice: str
    next_steps: List[str]
    
    emergency_resources: Dict[str, str]
    analysis_timestamp: str
    models_used: Dict[str, str]
    session_id: Optional[str] = None

# ==================== Startup/Shutdown ====================
@app.on_event("startup")
async def startup_event():
    """Initialize all analyzers on startup"""
    global text_analyzer, video_analyzer, audio_analyzer, gemini_integrator
    
    logger.info("=" * 60)
    logger.info("Starting Integrated Mental Health Analysis API v3.0.0")
    logger.info("=" * 60)
    
    # Initialize Text Analyzer
    try:
        text_analyzer = TextSentimentAnalyzer()
        logger.info("✓ Text Sentiment Analyzer initialized")
    except Exception as e:
        logger.error(f"✗ Failed to initialize Text Analyzer: {str(e)}")
        text_analyzer = None
    
    # Initialize Video Analyzer
    try:
        video_analyzer = VideoEmotionDetector(use_hf_model=True)
        logger.info("✓ Video Emotion Detector initialized")
    except Exception as e:
        logger.error(f"✗ Failed to initialize Video Analyzer: {str(e)}")
        video_analyzer = None
    
    # Initialize Audio Analyzer
    try:
        audio_analyzer = AudioEmotionAnalyzer()
        logger.info("✓ Audio Emotion Analyzer initialized")
    except Exception as e:
        logger.error(f"✗ Failed to initialize Audio Analyzer: {str(e)}")
        audio_analyzer = None
    
    # Initialize Gemini Integrator
    try:
        gemini_integrator = GeminiIntegrator()
        logger.info("✓ Gemini AI Integrator initialized")
    except Exception as e:
        logger.error(f"✗ Failed to initialize Gemini Integrator: {str(e)}")
        gemini_integrator = None
    
    logger.info("=" * 60)
    logger.info("API startup complete!")
    logger.info("=" * 60)

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources on shutdown"""
    if video_analyzer:
        video_analyzer.cleanup()
    logger.info("API shutdown complete")

# ==================== Health & Info Endpoints ====================
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Integrated Mental Health Analysis API",
        "version": "3.0.0",
        "status": "operational",
        "modules": {
            "text_analysis": text_analyzer is not None,
            "audio_analysis": audio_analyzer is not None,
            "video_analysis": video_analyzer is not None,
            "ai_recommendations": gemini_integrator is not None
        },
        "endpoints": {
            "text_analysis": "/analyze/text (POST)",
            "audio_analysis": "/analyze/audio (POST)",
            "video_analysis": "/analyze/video (POST)",
            "combined_analysis": "/analyze/combined (POST)",
            "health": "/health (GET)",
            "models": "/models (GET)"
        },
        "documentation": "/docs"
    }

@app.get("/health")
async def health_check():
    """Comprehensive health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "modules": {
            "text_analyzer": {
                "available": text_analyzer is not None,
                "initialized": text_analyzer.initialized if text_analyzer else False
            },
            "audio_analyzer": {
                "available": audio_analyzer is not None,
                "initialized": audio_analyzer.initialized if audio_analyzer else False
            },
            "video_analyzer": {
                "available": video_analyzer is not None,
                "initialized": video_analyzer.initialized if video_analyzer else False
            },
            "gemini_integrator": {
                "available": gemini_integrator is not None,
                "initialized": gemini_integrator.initialized if gemini_integrator else False
            }
        }
    }

@app.get("/models")
async def get_models_info():
    """Get information about all AI models being used"""
    return {
        "text_models": {
            "sentiment": "tabularisai/multilingual-sentiment-analysis",
            "recommendations": "meta-llama/Llama-3.1-8B-Instruct:novita",
            "status": "active" if text_analyzer else "inactive"
        },
        "audio_models": {
            "emotion_recognition": "firdhokk/speech-emotion-recognition-with-openai-whisper-large-v3",
            "status": "active" if audio_analyzer else "inactive"
        },
        "video_models": {
            "facial_emotion": "dima806/facial_emotions_image_detection",
            "face_detection": "MediaPipe Face Detection",
            "status": "active" if video_analyzer else "inactive"
        },
        "ai_integration": {
            "final_recommendations": "Google Gemini API",
            "status": "active" if gemini_integrator else "inactive"
        },
        "python_version": "3.12.7"
    }

# ==================== Individual Analysis Endpoints ====================
@app.post("/analyze/text", response_model=TextAnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):
    """
    Analyze text with AI-powered sentiment analysis
    
    - **text**: The text to analyze (required, 10-5000 chars)
    - **user_id**: Optional user identifier
    - **session_id**: Optional session identifier
    - **language**: Language context
    """
    if not text_analyzer:
        raise HTTPException(
            status_code=503,
            detail="Text analysis service is not available"
        )
    
    try:
        logger.info(f"Analyzing text (length: {len(request.text)} chars)")
        
        # Input validation
        if not request.text or len(request.text.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="Text must be at least 10 characters long"
            )
        
        if len(request.text) > 5000:
            raise HTTPException(
                status_code=400,
                detail="Text is too long (max 5000 characters)"
            )
        
        # Perform analysis
        analysis_result = text_analyzer.analyze_text(request.text)
        
        # Create response using the existing response model
        from text_analyzer import MentalHealthResources
        
        resources = MentalHealthResources(
            emergency_helplines=text_analyzer.MENTAL_HEALTH_RESOURCES["emergency_helplines"],
            telemedicine_services=text_analyzer.MENTAL_HEALTH_RESOURCES["telemedicine_services"],
            government_resources=text_analyzer.MENTAL_HEALTH_RESOURCES["government_resources"],
            regional_support=text_analyzer.MENTAL_HEALTH_RESOURCES["regional_support"]
        )
        
        response = TextAnalysisResponse(
            risk_level=analysis_result["risk_level"],
            risk_score=analysis_result["risk_score"],
            confidence=analysis_result["confidence"],
            sentiment_scores=analysis_result["sentiment_scores"],
            detected_emotions=analysis_result["detected_emotions"],
            keywords_found=analysis_result["keywords_found"],
            recommendations=analysis_result["recommendations"],
            next_step=analysis_result["next_step"],
            analysis_timestamp=datetime.now().isoformat(),
            session_id=request.session_id,
            model_used=analysis_result["model_used"],
            warning_flags=analysis_result.get("warning_flags", []),
            mental_health_resources=resources,
            context_notes=analysis_result.get("context_notes", [])
        )
        
        logger.info(f"Text analysis complete - Risk: {analysis_result['risk_level']}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Text analysis error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Text analysis failed: {str(e)}"
        )

@app.post("/analyze/audio")
async def analyze_audio(
    file: UploadFile = File(...),
    user_id: Optional[str] = None,
    session_id: Optional[str] = None
):
    """
    Analyze audio for emotion detection
    
    - **file**: Audio file (wav, mp3, m4a, flac, ogg)
    - **user_id**: Optional user identifier
    - **session_id**: Optional session identifier
    """
    if not audio_analyzer:
        raise HTTPException(
            status_code=503,
            detail="Audio analysis service is not available"
        )
    
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Get file extension
        file_ext = file.filename.split('.')[-1].lower()
        allowed_formats = ["wav", "mp3", "m4a", "flac", "ogg"]
        
        if file_ext not in allowed_formats:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported format. Allowed: {', '.join(allowed_formats)}"
            )
        
        # Read file
        audio_bytes = await file.read()
        
        logger.info(f"Processing audio file: {file.filename} ({len(audio_bytes)} bytes)")
        
        # Analyze audio
        result = audio_analyzer.analyze_audio_file(audio_bytes, file_ext)
        
        # Add metadata
        result["session_id"] = session_id
        result["user_id"] = user_id
        result["filename"] = file.filename
        
        logger.info(f"Audio analysis complete - Emotion: {result['primary_emotion']}, Risk: {result['risk_level']}")
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Audio analysis error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Audio analysis failed: {str(e)}"
        )

@app.post("/analyze/video")
async def analyze_video(
    file: UploadFile = File(...),
    frame_skip: Optional[int] = 10
):
    """
    Analyze video for facial emotion detection
    
    - **file**: Video file (mp4, avi, mov, webm)
    - **frame_skip**: Number of frames to skip (default: 10)
    """
    if not video_analyzer:
        raise HTTPException(
            status_code=503,
            detail="Video analysis service is not available"
        )
    
    import tempfile
    import shutil
    
    # Validate file type
    allowed_types = ["video/mp4", "video/avi", "video/mov", "video/webm", "video/x-msvideo"]
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_types)}"
        )
    
    # Create temporary file
    temp_dir = tempfile.mkdtemp()
    temp_video_path = os.path.join(temp_dir, file.filename)
    
    try:
        # Save uploaded file
        with open(temp_video_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"Processing video file: {file.filename}")
        
        # Process the video
        analysis_result = video_analyzer.process_video(temp_video_path, frame_skip=frame_skip)
        
        # Add metadata
        analysis_result["metadata"] = {
            "filename": file.filename,
            "content_type": file.content_type,
            "frame_skip": frame_skip,
            "processed_at": datetime.now().isoformat()
        }
        
        logger.info(f"Video analysis complete - Status: {analysis_result.get('status')}")
        
        return JSONResponse(content=analysis_result)
        
    except Exception as e:
        logger.error(f"Video analysis error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Video processing failed: {str(e)}"
        )
    finally:
        # Clean up temporary files
        try:
            if os.path.exists(temp_video_path):
                os.remove(temp_video_path)
            if os.path.exists(temp_dir):
                os.rmdir(temp_dir)
        except Exception as e:
            logger.warning(f"Failed to clean up temp files: {str(e)}")

# ==================== Combined Analysis Endpoint ====================
@app.post("/analyze/combined", response_model=CombinedAnalysisResponse)
async def analyze_combined(
    text: Optional[str] = None,
    audio_file: Optional[UploadFile] = File(None),
    video_file: Optional[UploadFile] = File(None),
    user_id: Optional[str] = None,
    session_id: Optional[str] = None
):
    """
    Perform combined analysis using available inputs (text, audio, video)
    and get AI-powered personalized recommendations from Gemini
    
    - **text**: Optional text input
    - **audio_file**: Optional audio file
    - **video_file**: Optional video file
    - **user_id**: Optional user identifier
    - **session_id**: Optional session identifier
    """
    
    if not text and not audio_file and not video_file:
        raise HTTPException(
            status_code=400,
            detail="At least one input (text, audio, or video) is required"
        )
    
    logger.info("=" * 60)
    logger.info("Starting combined analysis")
    logger.info(f"Inputs: text={bool(text)}, audio={bool(audio_file)}, video={bool(video_file)}")
    logger.info("=" * 60)
    
    results = {
        "text_analysis": None,
        "audio_analysis": None,
        "video_analysis": None
    }
    
    risk_scores = []
    confidences = []
    all_emotions = []
    models_used = {}
    
    # Analyze Text
    if text and text_analyzer:
        try:
            logger.info("Performing text analysis...")
            text_result = text_analyzer.analyze_text(text)
            results["text_analysis"] = text_result
            risk_scores.append(text_result["risk_score"])
            confidences.append(text_result["confidence"])
            all_emotions.extend(text_result["detected_emotions"])
            models_used["text"] = text_result["model_used"]
            logger.info(f"✓ Text analysis complete: {text_result['risk_level']}")
        except Exception as e:
            logger.error(f"Text analysis failed: {str(e)}")
    
    # Analyze Audio
    if audio_file and audio_analyzer:
        try:
            logger.info("Performing audio analysis...")
            audio_bytes = await audio_file.read()
            file_ext = audio_file.filename.split('.')[-1].lower()
            audio_result = audio_analyzer.analyze_audio_file(audio_bytes, file_ext)
            results["audio_analysis"] = audio_result
            risk_scores.append(audio_result["risk_score"])
            confidences.append(audio_result["confidence"])
            all_emotions.extend(audio_result["detected_emotions"])
            models_used["audio"] = audio_result["model_used"]
            logger.info(f"✓ Audio analysis complete: {audio_result['risk_level']}")
        except Exception as e:
            logger.error(f"Audio analysis failed: {str(e)}")
    
    # Analyze Video
    if video_file and video_analyzer:
        import tempfile
        import shutil
        
        temp_dir = tempfile.mkdtemp()
        temp_video_path = os.path.join(temp_dir, video_file.filename)
        
        try:
            logger.info("Performing video analysis...")
            with open(temp_video_path, "wb") as buffer:
                shutil.copyfileobj(video_file.file, buffer)
            
            video_result = video_analyzer.process_video(temp_video_path, frame_skip=10)
            results["video_analysis"] = video_result
            
            # Calculate risk from video emotions
            if video_result.get("status") == "success":
                video_risk_score = calculate_video_risk_score(video_result)
                risk_scores.append(video_risk_score)
                confidences.append(0.7)  # Default confidence for video
                
                # Add detected emotions
                if "summary" in video_result:
                    emotion_dist = video_result["summary"].get("emotion_distribution", {})
                    all_emotions.extend(list(emotion_dist.keys()))
            
            models_used["video"] = video_result.get("model_used", "MediaPipe + dima806/facial_emotions_image_detection")
            logger.info(f"✓ Video analysis complete")
            
        except Exception as e:
            logger.error(f"Video analysis failed: {str(e)}")
        finally:
            try:
                if os.path.exists(temp_video_path):
                    os.remove(temp_video_path)
                if os.path.exists(temp_dir):
                    os.rmdir(temp_dir)
            except:
                pass
    
    # Calculate overall metrics
    if not risk_scores:
        raise HTTPException(
            status_code=500,
            detail="No successful analysis performed"
        )
    
    overall_risk_score = sum(risk_scores) / len(risk_scores)
    overall_confidence = sum(confidences) / len(confidences)
    
    # Determine overall risk level
    if overall_risk_score >= 75:
        overall_risk_level = "CRITICAL"
    elif overall_risk_score >= 55:
        overall_risk_level = "HIGH"
    elif overall_risk_score >= 35:
        overall_risk_level = "MEDIUM"
    else:
        overall_risk_level = "LOW"
    
    # Remove duplicates from emotions
    combined_emotions = list(dict.fromkeys(all_emotions))[:10]
    
    logger.info(f"Overall analysis: Risk={overall_risk_level}, Score={overall_risk_score:.1f}")
    
    # Get AI recommendations from Gemini
    ai_recommendations = []
    personalized_advice = ""
    
    if gemini_integrator:
        try:
            logger.info("Generating AI recommendations with Gemini...")
            gemini_response = gemini_integrator.generate_recommendations(
                overall_risk_score=overall_risk_score,
                overall_risk_level=overall_risk_level,
                text_analysis=results["text_analysis"],
                audio_analysis=results["audio_analysis"],
                video_analysis=results["video_analysis"],
                combined_emotions=combined_emotions
            )
            ai_recommendations = gemini_response["recommendations"]
            personalized_advice = gemini_response["personalized_advice"]
            logger.info("✓ AI recommendations generated")
        except Exception as e:
            logger.error(f"Gemini integration failed: {str(e)}")
            ai_recommendations = get_fallback_recommendations(overall_risk_level)
            personalized_advice = "AI recommendations temporarily unavailable. Please consult a mental health professional for personalized guidance."
    else:
        ai_recommendations = get_fallback_recommendations(overall_risk_level)
        personalized_advice = "AI recommendations not available. Please consult a mental health professional."
    
    # Generate next steps
    next_steps = generate_next_steps(overall_risk_level, combined_emotions)
    
    # Emergency resources
    emergency_resources = {
        "Vandrevala Foundation": "9999666555",
        "iCall": "+91-9152987821",
        "AASRA": "91-9820466726",
        "National Mental Health Helpline": "08046110007"
    }
    
    response = CombinedAnalysisResponse(
        overall_risk_level=overall_risk_level,
        overall_risk_score=round(overall_risk_score, 2),
        overall_confidence=round(overall_confidence, 2),
        text_analysis=results["text_analysis"],
        audio_analysis=results["audio_analysis"],
        video_analysis=results["video_analysis"],
        combined_emotions=combined_emotions,
        ai_recommendations=ai_recommendations,
        personalized_advice=personalized_advice,
        next_steps=next_steps,
        emergency_resources=emergency_resources,
        analysis_timestamp=datetime.now().isoformat(),
        models_used=models_used,
        session_id=session_id
    )
    
    logger.info("=" * 60)
    logger.info("Combined analysis complete!")
    logger.info("=" * 60)
    
    return response

# ==================== Helper Functions ====================
def calculate_video_risk_score(video_result: Dict) -> float:
    """Calculate risk score from video emotion analysis"""
    if video_result.get("status") != "success":
        return 30.0  # Default medium-low risk
    
    summary = video_result.get("summary", {})
    emotion_dist = summary.get("emotion_distribution", {})
    
    # Risk weights for emotions
    emotion_risks = {
        "sadness": 70,
        "fear": 65,
        "anger": 60,
        "disgust": 50,
        "neutral": 30,
        "surprise": 25,
        "happy": 15
    }
    
    risk_score = 0
    total_weight = 0
    
    for emotion, percentage in emotion_dist.items():
        weight = emotion_risks.get(emotion.lower(), 40)
        risk_score += (weight * percentage / 100)
        total_weight += percentage
    
    if total_weight > 0:
        return risk_score
    else:
        return 30.0

def get_fallback_recommendations(risk_level: str) -> List[str]:
    """Fallback recommendations when Gemini is unavailable"""
    recommendations = {
        "LOW": [
            "Continue practicing daily self-care activities",
            "Maintain regular sleep schedule and healthy eating habits",
            "Stay connected with friends and family"
        ],
        "MEDIUM": [
            "Consider scheduling a consultation with a mental health professional",
            "Practice stress-reduction techniques like meditation or deep breathing",
            "Reach out to supportive friends or family members"
        ],
        "HIGH": [
            "Urgently consult with a mental health professional",
            "Create a safety plan with trusted contacts",
            "Avoid isolation and stay with supportive people"
        ],
        "CRITICAL": [
            "🚨 CALL A CRISIS HELPLINE IMMEDIATELY",
            "🚨 Go to the nearest emergency department",
            "🚨 Do not stay alone - contact a trusted person NOW"
        ]
    }
    return recommendations.get(risk_level, recommendations["MEDIUM"])

def generate_next_steps(risk_level: str, emotions: List[str]) -> List[str]:
    """Generate actionable next steps"""
    base_steps = {
        "LOW": [
            "Continue monitoring your mental wellbeing",
            "Maintain healthy lifestyle habits",
            "Practice mindfulness or meditation regularly"
        ],
        "MEDIUM": [
            "Schedule an appointment with a counselor or therapist",
            "Explore online therapy platforms for convenient access",
            "Join a support group or community"
        ],
        "HIGH": [
            "Seek immediate professional mental health support",
            "Inform a trusted person about your situation",
            "Remove access to any means of self-harm"
        ],
        "CRITICAL": [
            "Contact emergency services or crisis helpline NOW",
            "Go to nearest hospital emergency department",
            "Stay with a trusted person continuously"
        ]
    }
    
    steps = base_steps.get(risk_level, base_steps["MEDIUM"])
    
    # Add emotion-specific steps
    if "anxiety" in emotions or "fear" in emotions:
        steps.append("Practice breathing exercises for anxiety management")
    
    if "sadness" in emotions:
        steps.append("Engage in activities that previously brought you joy")
    
    return steps

# ==================== Main Execution ====================
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Integrated Mental Health Analysis API")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind to")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload")
    
    args = parser.parse_args()
    
    print("\n" + "=" * 70)
    print("🧠 INTEGRATED MENTAL HEALTH ANALYSIS API v3.0.0")
    print("=" * 70)
    print(f"📡 API Endpoint: http://{args.host}:{args.port}")
    print(f"📚 Documentation: http://{args.host}:{args.port}/docs")
    print(f"🔧 Models: Text + Audio + Video + Gemini AI")
    print("=" * 70)
    print("\nPress Ctrl+C to stop\n")
    
    uvicorn.run(
        "main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level="info",
        access_log=True
    )
