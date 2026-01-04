# text_analyzer.py - Text Sentiment Analysis Module with HF API
from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict
from typing import Dict, List, Optional, Literal
import logging
from datetime import datetime
import re
import os
import requests
import json
from dotenv import load_dotenv
import time

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== Hugging Face Configuration ====================
HF_TOKEN = os.getenv("HF_TOKEN")
if not HF_TOKEN:
    logger.warning("HF_TOKEN not found in .env file. Using fallback analysis only.")
    HF_AVAILABLE = False
else:
    HF_AVAILABLE = True
    logger.info("Hugging Face API configured")

# ==================== Model Configuration ====================
SENTIMENT_MODEL = "tabularisai/multilingual-sentiment-analysis"
TEXT_GEN_MODEL = "meta-llama/Llama-3.1-8B-Instruct"

# ==================== Hugging Face API Endpoints ====================
HF_API_BASE = "https://router.huggingface.co/"

# ==================== Pydantic Models ====================
class TextAnalysisRequest(BaseModel):
    text: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    language: Optional[str] = "english"

class MentalHealthResources(BaseModel):
    emergency_helplines: Dict[str, str]
    telemedicine_services: Dict[str, str]
    government_resources: Dict[str, str]
    regional_support: Dict[str, str]

class TextAnalysisResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    risk_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    risk_score: float
    confidence: float
    sentiment_scores: Dict[str, float]
    detected_emotions: List[str]
    keywords_found: List[str]
    recommendations: List[str]
    next_step: str
    analysis_timestamp: str
    session_id: Optional[str] = None
    model_used: str
    warning_flags: List[str]
    mental_health_resources: MentalHealthResources
    context_notes: List[str]

# ==================== AI-Powered Sentiment Analyzer ====================
class TextSentimentAnalyzer:
    """Advanced sentiment analyzer using Hugging Face models"""
    
    def __init__(self):
        self.initialized = True
        self.hf_available = HF_AVAILABLE
        self.hf_token = HF_TOKEN
        
    # ==================== MENTAL HEALTH RESOURCES ====================
    MENTAL_HEALTH_RESOURCES = {
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
    
    # ==================== RISK PATTERNS ====================
    RISK_PATTERNS = {
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
    
    def _make_hf_api_call(self, model: str, payload: dict):
        """Make API call to Hugging Face"""
        try:
            headers = {
                "Authorization": f"Bearer {self.hf_token}",
                "Content-Type": "application/json"
            }
            
            url = f"{HF_API_BASE}/{model}"
            logger.info(f"Calling HF API: {model}")
            
            response = requests.post(
                url,
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"HF API error {response.status_code}: {response.text[:200]}")
                return None
                
        except Exception as e:
            logger.error(f"HF API call failed: {str(e)}")
            return None
    
    def analyze_sentiment_with_hf(self, text: str):
        """Analyze sentiment using Hugging Face models"""
        if not self.hf_available:
            logger.info("HF API not available, using fallback")
            return None
        
        try:
            logger.info(f"Analyzing sentiment with model: {SENTIMENT_MODEL}")
            
            payload = {"inputs": text}
            result = self._make_hf_api_call(SENTIMENT_MODEL, payload)
            
            if result and isinstance(result, list) and len(result) > 0:
                sentiment = result[0]
                
                if isinstance(sentiment, list) and len(sentiment) > 0:
                    sentiment = sentiment[0]
                
                if isinstance(sentiment, dict) and 'label' in sentiment and 'score' in sentiment:
                    label = sentiment['label']
                    score = sentiment['score']
                    
                    logger.info(f"Sentiment analysis successful: {label} ({score:.2f})")
                    
                    label_lower = str(label).lower()
                    
                    if 'negative' in label_lower:
                        mapped_label = "NEGATIVE"
                    elif 'positive' in label_lower:
                        mapped_label = "POSITIVE"
                    elif 'neutral' in label_lower:
                        mapped_label = "NEUTRAL"
                    else:
                        mapped_label = str(label).upper()
                    
                    return {
                        "label": mapped_label,
                        "score": float(score),
                        "raw_label": str(label)
                    }
            
            return None
            
        except Exception as e:
            logger.error(f"Hugging Face sentiment analysis error: {str(e)}")
            return None
    
    def detect_risk_keywords(self, text: str):
        """Detect risk keywords in text"""
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
    
    def detect_emotions(self, text: str):
        """Detect basic emotions from text"""
        text_lower = text.lower()
        emotions = []
        
        emotion_patterns = {
            "anger": ["angry", "mad", "frustrated", "irritated", "annoyed", "furious"],
            "fear": ["scared", "afraid", "anxious", "worried", "nervous", "panic", "terrified"],
            "sadness": ["sad", "depressed", "hopeless", "empty", "lonely", "miserable", "heartbroken"],
            "stress": ["stressed", "pressure", "overwhelmed", "burdened", "tension", "burned out"],
            "confusion": ["confused", "lost", "uncertain", "unsure", "doubt", "disoriented"],
            "loneliness": ["lonely", "isolated", "alone", "abandoned", "separated"],
            "guilt": ["guilty", "ashamed", "remorseful", "regretful", "blame"],
            "anxiety": ["anxious", "worried", "nervous", "restless", "on edge", "uneasy"]
        }
        
        for emotion, words in emotion_patterns.items():
            if any(word in text_lower for word in words):
                emotions.append(emotion)
        
        return list(dict.fromkeys(emotions))[:5]
    
    def get_fallback_recommendations(self, risk_level: str):
        """Fallback recommendations when AI fails"""
        recommendations = {
            "LOW": [
                "Practice daily mindfulness or meditation (even 5 minutes can help)",
                "Maintain regular sleep schedule (7-8 hours per night)",
                "Share your feelings with a trusted friend or family member"
            ],
            "MEDIUM": [
                "Consider talking to a counselor or therapist for professional support",
                "Explore online therapy options for convenient access to help",
                "Join supportive peer groups or online communities"
            ],
            "HIGH": [
                "CONSULT A MENTAL HEALTH PROFESSIONAL URGENTLY",
                "Create and follow a detailed safety plan with professional guidance",
                "Remove access to harmful items immediately for your safety"
            ],
            "CRITICAL": [
                "🚨 CALL A MENTAL HEALTH HELPLINE IMMEDIATELY",
                "🚨 Go to the nearest hospital emergency department NOW",
                "🚨 Do not stay alone - be with a trusted person continuously"
            ]
        }
        
        return recommendations.get(risk_level, recommendations["MEDIUM"])
    
    def analyze_text(self, text: str):
        """Main analysis method"""
        text = text.strip()
        
        if len(text) < 10:
            return self.get_minimal_analysis()
        
        # Detect risk keywords
        keywords, risk_level = self.detect_risk_keywords(text)
        
        # Analyze sentiment with HF if available
        sentiment_result = None
        model_used = "Keyword Analysis"
        
        if self.hf_available:
            try:
                sentiment_result = self.analyze_sentiment_with_hf(text)
                if sentiment_result:
                    model_used = f"Hugging Face: {SENTIMENT_MODEL}"
                    logger.info(f"Sentiment: {sentiment_result['label']} ({sentiment_result['score']:.2f})")
                else:
                    logger.warning("Sentiment analysis returned None")
            except Exception as e:
                logger.error(f"Sentiment analysis failed: {str(e)}")
                sentiment_result = None
        
        # Get sentiment scores
        if sentiment_result:
            sentiment_label = sentiment_result["label"].lower()
            sentiment_score = sentiment_result["score"]
            
            if "negative" in sentiment_label:
                sentiment_value = 100 - (sentiment_score * 100)
            elif "positive" in sentiment_label:
                sentiment_value = sentiment_score * 100
            else:
                sentiment_value = 50
        else:
            sentiment_base = {"LOW": 70, "MEDIUM": 50, "HIGH": 30, "CRITICAL": 15}
            sentiment_value = sentiment_base.get(risk_level, 50)
        
        # Detect emotions
        emotions = self.detect_emotions(text)
        
        # Calculate risk score
        risk_base = {"LOW": 20, "MEDIUM": 45, "HIGH": 70, "CRITICAL": 90}
        risk_score = risk_base.get(risk_level, 50)
        
        # Adjust based on sentiment
        sentiment_adjustment = (100 - sentiment_value) * 0.3
        risk_score = min(100, risk_score + sentiment_adjustment)
        
        # Adjust based on number of keywords
        keyword_adjustment = len(keywords) * 5
        risk_score = min(100, risk_score + keyword_adjustment)
        
        # Calculate confidence
        confidence = 0.6 + (len(keywords) * 0.05) + (0.2 if sentiment_result else 0)
        confidence = min(0.95, confidence)
        
        # Get recommendations
        recommendations = self.get_fallback_recommendations(risk_level)
        
        # Get next step based on risk level
        next_steps = {
            "LOW": "Continue self-care practices and monitor your wellbeing",
            "MEDIUM": "Consider seeking professional support for better guidance",
            "HIGH": "Urgently consult with a mental health professional",
            "CRITICAL": "Immediate intervention required - use emergency resources"
        }
        next_step = next_steps.get(risk_level, "Monitor your mental health regularly")
        
        # Prepare results
        results = {
            "risk_level": risk_level,
            "risk_score": float(round(risk_score, 1)),
            "confidence": float(round(confidence, 2)),
            "sentiment_scores": {
                "overall": float(round(sentiment_value, 1)),
                "positive_ratio": float(round(sentiment_value / 100, 2)),
                "negative_ratio": float(round(1 - (sentiment_value / 100), 2))
            },
            "detected_emotions": emotions,
            "keywords_found": keywords[:10],
            "recommendations": recommendations[:3],
            "next_step": next_step,
            "analysis_timestamp": datetime.now().isoformat(),
            "model_used": model_used,
            "warning_flags": [],
            "mental_health_resources": self.MENTAL_HEALTH_RESOURCES,
            "context_notes": []
        }
        
        # Add warning flags
        if risk_level in ["CRITICAL", "HIGH"]:
            results["warning_flags"].append(f"Detected {risk_level} risk level")
        
        if any(word in text.lower() for word in ["suicide", "kill myself", "end my life", "want to die"]):
            results["warning_flags"].append("Suicidal ideation detected - Immediate help recommended")
        
        if len(keywords) > 5:
            results["warning_flags"].append(f"Multiple risk indicators detected ({len(keywords)})")
        
        # Add context notes
        context_notes = [
            f"Analysis complete using {model_used}",
            f"Risk level: {risk_level}",
            f"Keywords detected: {len(keywords)}",
            f"Text length: {len(text)} characters",
            f"Hugging Face API: {'Available' if self.hf_available else 'Not available'}"
        ]
        
        if not sentiment_result:
            context_notes.append("Using fallback sentiment analysis")
        
        results["context_notes"] = context_notes
        
        return results
    
    def get_minimal_analysis(self):
        """Return minimal analysis for very short text"""
        return {
            "risk_level": "LOW",
            "risk_score": 20.0,
            "confidence": 0.5,
            "sentiment_scores": {
                "overall": 50.0,
                "positive_ratio": 0.5,
                "negative_ratio": 0.5
            },
            "detected_emotions": [],
            "keywords_found": ["Text too short for detailed analysis"],
            "recommendations": self.get_fallback_recommendations("LOW")[:3],
            "next_step": "Write more details for better analysis",
            "analysis_timestamp": datetime.now().isoformat(),
            "model_used": "Fallback Analysis",
            "warning_flags": ["Text is very short - consider writing more for better analysis"],
            "mental_health_resources": self.MENTAL_HEALTH_RESOURCES,
            "context_notes": ["Text too short for AI analysis"]
        }
