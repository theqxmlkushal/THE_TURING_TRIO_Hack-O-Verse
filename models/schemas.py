from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Literal, Any
from datetime import datetime


class AudioAnalysisRequest(BaseModel):
    """Request model for audio analysis"""
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    language: Optional[str] = "english"
    metadata: Optional[Dict[str, Any]] = None


class MentalHealthResources(BaseModel):
    """Mental health resources model"""
    emergency_helplines: Dict[str, str]
    telemedicine_services: Dict[str, str]
    government_resources: Dict[str, str]
    regional_support: Dict[str, str]


class AudioAnalysisResponse(BaseModel):
    """Response model for audio analysis"""
    success: bool
    risk_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    risk_score: float = Field(..., ge=0, le=100)
    confidence: float = Field(..., ge=0, le=1)
    
    # Emotion analysis results
    primary_emotion: str
    emotion_scores: Dict[str, float]
    detected_emotions: List[str]
    
    # Audio metadata
    audio_duration: float
    sample_rate: int
    format: Optional[str]
    
    # Transcription if available
    transcription: Optional[str] = None
    transcription_confidence: Optional[float] = None
    
    # Risk indicators
    keywords_found: List[str]
    risk_indicators: List[str]
    
    # Recommendations
    recommendations: List[str]
    immediate_actions: List[str]
    long_term_strategies: List[str]
    
    # Resources
    next_step: str
    warning_flags: List[str]
    mental_health_resources: MentalHealthResources
    
    # Technical info
    analysis_timestamp: str
    session_id: Optional[str] = None
    model_used: str
    processing_time: float
    context_notes: List[str]
    
    # File info
    file_size: int
    file_name: Optional[str] = None


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    details: Optional[str] = None
    timestamp: str = datetime.now().isoformat()


class HealthCheckResponse(BaseModel):
    """Health check response model"""
    status: str
    timestamp: str
    audio_model_status: str
    transcription_status: str
    models_loaded: List[str]
    memory_usage: str
    api_version: str = "1.0.0"


class ModelInfoResponse(BaseModel):
    """Model information response"""
    audio_emotion_model: str
    transcription_model: str
    sample_rate: int
    max_duration: int
    supported_formats: List[str]
    status: str
    description: str