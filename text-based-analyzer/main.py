# main.py - Mental Health Sentiment Analysis API with Hugging Face
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Literal
import logging
from datetime import datetime
import uvicorn
import re
import json
import os
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import time

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Mental Health Sentiment Analysis API",
    description="AI-powered text-based sentiment analysis with risk scoring and personalized recommendations",
    version="5.0.0"
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://mannkibaat-rehab.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Hugging Face Configuration ====================
HF_TOKEN = os.getenv("HF_TOKEN")
if not HF_TOKEN:
    logger.warning("HF_TOKEN not found in .env file. Using fallback analysis.")
    HF_AVAILABLE = False
else:
    try:
        # Initialize client for sentiment analysis
        hf_client = InferenceClient(
            provider="hf-inference",
            api_key=HF_TOKEN,
            timeout=30.0
        )
        HF_AVAILABLE = True
        logger.info("Hugging Face Inference API configured successfully")
    except Exception as e:
        logger.error(f"Failed to configure Hugging Face API: {str(e)}")
        HF_AVAILABLE = False

# ==================== Model Configuration ====================
SENTIMENT_MODEL = "tabularisai/multilingual-sentiment-analysis"
TEXT_GEN_MODEL = "meta-llama/Llama-3.1-8B-Instruct"  # Chat completion model

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

class AnalysisResponse(BaseModel):
    risk_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    risk_score: float  # 0-100 scale
    confidence: float  # 0-1 scale
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

class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None

# ==================== AI-Powered Sentiment Analyzer ====================
class AISentimentAnalyzer:
    """Advanced sentiment analyzer using Hugging Face models"""
    
    def __init__(self):
        self.initialized = HF_AVAILABLE
        # Initialize chat client separately
        if HF_AVAILABLE:
            try:
                self.chat_client = InferenceClient(
                    api_key=HF_TOKEN,
                    timeout=30.0
                )
                self.chat_available = True
                logger.info("Chat completion client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize chat client: {str(e)}")
                self.chat_available = False
        else:
            self.chat_available = False
        
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
    
    def analyze_sentiment_with_hf(self, text: str):
        """Analyze sentiment using tabularisai/multilingual-sentiment-analysis"""
        if not HF_AVAILABLE:
            return None
        
        try:
            logger.info(f"Analyzing sentiment with model: {SENTIMENT_MODEL}")
            
            result = hf_client.text_classification(
                text,
                model=SENTIMENT_MODEL
            )
            
            if result and len(result) > 0:
                sentiment = result[0]
                logger.info(f"Sentiment analysis successful: {sentiment.label} ({sentiment.score:.2f})")
                
                # Map labels to consistent format
                label_lower = sentiment.label.lower()
                
                if 'negative' in label_lower:
                    mapped_label = "NEGATIVE"
                elif 'positive' in label_lower:
                    mapped_label = "POSITIVE"
                elif 'neutral' in label_lower:
                    mapped_label = "NEUTRAL"
                else:
                    mapped_label = sentiment.label.upper()
                
                return {
                    "label": mapped_label,
                    "score": sentiment.score,
                    "raw_label": sentiment.label
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Hugging Face sentiment analysis error: {str(e)}")
            return None
    
    def generate_recommendations_with_hf(self, text: str, risk_level: str):
        """Generate recommendations using Llama 3.1 8B Instruct"""
        if not HF_AVAILABLE or not self.chat_available:
            return self.get_fallback_recommendations(risk_level)[:3]
        
        try:
            # Clean and prepare the text
            clean_text = text[:300].replace('"', "'").replace('\n', ' ').strip()
            
            # Create a stricter system prompt for better formatting
            system_prompt = """You are a mental health support assistant. Your task is to provide exactly 3 recommendations in a specific format.

IMPORTANT FORMATTING RULES:
1. You MUST output EXACTLY 3 recommendations
2. Each recommendation MUST start with a number followed by a period and space (e.g., "1. ", "2. ", "3. ")
3. Each recommendation MUST be on its own line
4. Each recommendation MUST end with a period
5. Each recommendation MUST be 10-50 words
6. DO NOT add any other text before or after the recommendations
7. DO NOT write explanations, just the recommendations
8. Make recommendations practical and actionable

Example of correct format:
1. Practice deep breathing for 5 minutes when feeling anxious.
2. Talk to a trusted friend or family member about your feelings.
3. Consider scheduling an appointment with a mental health professional.

Now provide your 3 recommendations:"""
            
            # Create user prompt based on risk level
            risk_contexts = {
                "LOW": "mild emotional distress",
                "MEDIUM": "moderate emotional challenges that could benefit from support",
                "HIGH": "significant emotional distress needing attention",
                "CRITICAL": "urgent emotional crisis requiring immediate support"
            }
            
            user_prompt = f"""User is experiencing {risk_contexts.get(risk_level, 'emotional challenges')}.

User's statement: "{clean_text}"

Provide exactly 3 practical mental health recommendations following the format rules above.
Focus on coping strategies, professional support, and self-care practices."""

            logger.info(f"Generating recommendations with model: {TEXT_GEN_MODEL}")
            
            # Generate with chat completion
            try:
                completion = self.chat_client.chat.completions.create(
                    model=TEXT_GEN_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    max_tokens=250,
                    temperature=0.7,
                    top_p=0.9
                )
                
                response = completion.choices[0].message.content
                logger.info(f"Raw model response: {response}")
                
                # Parse recommendations from response
                recommendations = []
                lines = response.split('\n')
                
                for line in lines:
                    line = line.strip()
                    # Look for properly formatted numbered recommendations
                    if re.match(r'^\d+\.\s+', line):
                        # Remove the number prefix
                        rec = re.sub(r'^\d+\.\s+', '', line)
                        rec = rec.strip()
                        
                        # Clean up any extra punctuation or spaces
                        rec = re.sub(r'\s+', ' ', rec)
                        rec = re.sub(r'\.+$', '.', rec)  # Ensure single period at end
                        
                        if rec and 10 < len(rec) < 200:
                            # Ensure it ends with a period
                            if not rec.endswith('.'):
                                rec = rec + '.'
                            recommendations.append(rec)
                
                # If we don't have exactly 3 properly formatted recommendations, try alternative parsing
                if len(recommendations) != 3:
                    logger.warning(f"Got {len(recommendations)} formatted recommendations, trying alternative parsing")
                    
                    # Try to find any sentences that look like recommendations
                    all_sentences = []
                    current_sentence = ""
                    
                    for char in response:
                        current_sentence += char
                        if char in '.!?':
                            sentence = current_sentence.strip()
                            if (10 < len(sentence) < 200 and 
                                not any(phrase in sentence.lower() for phrase in 
                                        ['as an ai', 'i cannot', 'i am not', 'please note', 'remember that']) and
                                any(keyword in sentence.lower() for keyword in 
                                    ['try', 'practice', 'consider', 'seek', 'talk', 'join', 'reach', 
                                     'contact', 'call', 'exercise', 'meditate', 'breathe', 'sleep', 'eat'])):
                                
                                # Clean the sentence
                                sentence = re.sub(r'^\d+[\.\)]\s*', '', sentence)  # Remove any numbers
                                sentence = re.sub(r'[*_`"#-]', '', sentence)  # Remove special chars
                                sentence = re.sub(r'\s+', ' ', sentence).strip()
                                
                                if not sentence.endswith('.'):
                                    sentence = sentence + '.'
                                
                                all_sentences.append(sentence)
                            current_sentence = ""
                    
                    # Take the best 3 sentences
                    if all_sentences:
                        # Score sentences by how recommendation-like they are
                        scored_sentences = []
                        for sentence in all_sentences:
                            score = 0
                            if len(sentence) > 15 and len(sentence) < 100:
                                score += 2
                            if any(action_word in sentence.lower() for action_word in 
                                   ['try', 'practice', 'consider', 'seek', 'talk']):
                                score += 3
                            if 'professional' in sentence.lower():
                                score += 2
                            if any(emotion_word in sentence.lower() for emotion_word in 
                                   ['anxious', 'stress', 'worry', 'feel', 'emotion']):
                                score += 1
                            
                            scored_sentences.append((score, sentence))
                        
                        # Sort by score and take top 3
                        scored_sentences.sort(reverse=True, key=lambda x: x[0])
                        recommendations = [s[1] for s in scored_sentences[:3]]
                
                # Final validation and cleanup
                valid_recommendations = []
                for rec in recommendations:
                    # Skip if too short or contains problematic phrases
                    if (15 < len(rec) < 200 and 
                        not any(phrase in rec.lower() for phrase in 
                               ['as an ai', 'i cannot', 'i am not', 'model', 'language model']) and
                        'recommendation' not in rec.lower()):
                        
                        # Ensure proper capitalization and punctuation
                        if not rec[0].isupper():
                            rec = rec[0].upper() + rec[1:]
                        if not rec.endswith('.'):
                            rec = rec + '.'
                        
                        valid_recommendations.append(rec)
                
                if valid_recommendations:
                    logger.info(f"Generated {len(valid_recommendations)} valid recommendations")
                    # If we have less than 3, add fallback recommendations
                    if len(valid_recommendations) < 3:
                        fallback_needed = 3 - len(valid_recommendations)
                        fallbacks = self.get_fallback_recommendations(risk_level)[:fallback_needed]
                        valid_recommendations.extend(fallbacks)
                    
                    return valid_recommendations[:3]
                else:
                    logger.warning("No valid recommendations parsed from model response")
                    return self.get_fallback_recommendations(risk_level)[:3]
                    
            except Exception as chat_error:
                logger.error(f"Chat completion failed: {str(chat_error)}")
                
                # Try a simpler approach with text generation
                try:
                    logger.info("Trying simple text generation fallback")
                    simple_prompt = f"""Based on this: "{clean_text[:100]}"
                    
Provide 3 specific mental health recommendations:
1. """
                    
                    fallback_response = hf_client.text_generation(
                        simple_prompt,
                        model="gpt2",
                        max_new_tokens=150,
                        temperature=0.7,
                        do_sample=True
                    )
                    
                    # Extract recommendations
                    recs = []
                    current_num = 1
                    for match in re.finditer(r'\d+\.\s*([^.]+\.)', fallback_response):
                        rec = match.group(1).strip()
                        if 10 < len(rec) < 150:
                            recs.append(rec)
                            current_num += 1
                            if current_num > 3:
                                break
                    
                    if recs:
                        return recs[:3]
                except Exception:
                    pass
                
                return self.get_fallback_recommendations(risk_level)[:3]
                
        except Exception as e:
            logger.error(f"Recommendations generation error: {str(e)}")
            return self.get_fallback_recommendations(risk_level)[:3]
    
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
        
        # Return unique emotions, max 5
        return list(dict.fromkeys(emotions))[:5]
    
    def get_fallback_recommendations(self, risk_level: str):
        """Fallback recommendations when AI fails"""
        recommendations = {
            "LOW": [
                "Practice daily mindfulness or meditation (even 5 minutes can help)",
                "Maintain regular sleep schedule (7-8 hours per night)",
                "Share your feelings with a trusted friend or family member",
                "Engage in light physical activity like walking or stretching",
                "Limit social media use and comparison to others"
            ],
            "MEDIUM": [
                "Consider talking to a counselor or therapist for professional support",
                "Explore online therapy options for convenient access to help",
                "Join supportive peer groups or online communities",
                "Practice stress management techniques like deep breathing daily",
                "Consider a mental health screening with a healthcare provider"
            ],
            "HIGH": [
                "CONSULT A MENTAL HEALTH PROFESSIONAL URGENTLY",
                "Create and follow a detailed safety plan with professional guidance",
                "Remove access to harmful items immediately for your safety",
                "Increase contact with supportive people and avoid isolation",
                "Use crisis helplines when needed - they are available 24/7"
            ],
            "CRITICAL": [
                "🚨 CALL A MENTAL HEALTH HELPLINE IMMEDIATELY",
                "🚨 Go to the nearest hospital emergency department NOW",
                "🚨 Do not stay alone - be with a trusted person continuously",
                "🚨 Remove all access to potentially harmful means",
                "🚨 Inform a trusted person about your situation immediately"
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
        
        if HF_AVAILABLE:
            try:
                sentiment_result = self.analyze_sentiment_with_hf(text)
                if sentiment_result:
                    model_used = f"Hugging Face: {SENTIMENT_MODEL}"
                    logger.info(f"Sentiment: {sentiment_result['label']} ({sentiment_result['score']:.2f})")
            except Exception as e:
                logger.error(f"Sentiment analysis failed: {str(e)}")
                sentiment_result = None
        
        # Get sentiment scores
        if sentiment_result:
            sentiment_label = sentiment_result["label"].lower()
            sentiment_score = sentiment_result["score"]
            
            # Convert sentiment to 0-100 scale
            if "negative" in sentiment_label:
                sentiment_value = 100 - (sentiment_score * 100)
            elif "positive" in sentiment_label:
                sentiment_value = sentiment_score * 100
            else:
                # Neutral or other labels
                sentiment_value = 50
        else:
            # Fallback sentiment based on risk level
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
        
        # Generate recommendations
        recommendations = []
        if HF_AVAILABLE and self.chat_available:
            try:
                ai_recommendations = self.generate_recommendations_with_hf(text, risk_level)
                if ai_recommendations:
                    recommendations = ai_recommendations
                    model_used = f"Hugging Face AI: {SENTIMENT_MODEL} + {TEXT_GEN_MODEL}"
                    logger.info(f"AI generated {len(recommendations)} recommendations")
                else:
                    logger.warning("AI recommendations failed, using fallback")
                    recommendations = self.get_fallback_recommendations(risk_level)[:5]
            except Exception as e:
                logger.error(f"Recommendation generation failed: {str(e)}")
                recommendations = self.get_fallback_recommendations(risk_level)[:5]
        else:
            recommendations = self.get_fallback_recommendations(risk_level)[:5]
        
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
            "keywords_found": keywords[:10],  # Top 10 keywords
            "recommendations": recommendations[:5],  # Top 5 recommendations
            "warning_flags": [],
            "analysis_summary": f"Analysis complete using {model_used}",
            "model_used": model_used
        }
        
        # Add warning flags
        if risk_level in ["CRITICAL", "HIGH"]:
            results["warning_flags"].append(f"Detected {risk_level} risk level")
        
        if any(word in text.lower() for word in ["suicide", "kill myself", "end my life", "want to die"]):
            results["warning_flags"].append("Suicidal ideation detected - Immediate help recommended")
        
        # Add additional flags based on keywords
        if len(keywords) > 5:
            results["warning_flags"].append(f"Multiple risk indicators detected ({len(keywords)})")
        
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
            "warning_flags": ["Text is very short - consider writing more for better analysis"],
            "analysis_summary": "Minimal analysis due to short text input",
            "model_used": "Fallback Analysis"
        }

# Initialize analyzer
analyzer = AISentimentAnalyzer()

# ==================== API Endpoints ====================
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Mental Health Sentiment Analysis API",
        "version": "5.0.0",
        "status": "ready" if analyzer.initialized else "basic",
        "ai_available": HF_AVAILABLE,
        "models": {
            "sentiment": SENTIMENT_MODEL,
            "text_generation": TEXT_GEN_MODEL
        } if HF_AVAILABLE else None,
        "features": [
            "AI-generated sentiment analysis",
            "AI-generated personalized recommendations",
            "Risk level assessment",
            "Mental health resources directory"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint with AI status"""
    try:
        # Test HF connection
        hf_test = False
        chat_test = False
        
        if HF_AVAILABLE:
            try:
                # Test sentiment model
                test_text = "I feel happy"
                hf_client.text_classification(test_text, model=SENTIMENT_MODEL)
                hf_test = True
                
                # Test chat model availability
                if hasattr(analyzer, 'chat_available') and analyzer.chat_available:
                    chat_test = True
            except Exception as e:
                logger.warning(f"HF model test failed: {str(e)}")
                hf_test = False
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "ai_available": HF_AVAILABLE and hf_test,
            "chat_available": chat_test,
            "ai_status": "Active" if (HF_AVAILABLE and hf_test) else "Not Available",
            "models": {
                "sentiment": SENTIMENT_MODEL,
                "text_generation": TEXT_GEN_MODEL
            },
            "memory_usage": "OK"
        }
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return {
            "status": "degraded",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

@app.get("/resources")
async def get_resources():
    """Get mental health resources"""
    return {
        "status": "Mental health resources",
        "last_updated": datetime.now().strftime("%Y-%m-%d"),
        "resources": analyzer.MENTAL_HEALTH_RESOURCES,
        "note": "These are emergency and support resources. Use when needed."
    }

@app.get("/models")
async def get_models():
    """Get information about the AI models being used"""
    chat_status = "available" if hasattr(analyzer, 'chat_available') and analyzer.chat_available else "unavailable"
    
    return {
        "sentiment_model": SENTIMENT_MODEL,
        "text_generation_model": TEXT_GEN_MODEL,
        "status": "active" if HF_AVAILABLE else "inactive",
        "chat_available": chat_status,
        "supports_multilingual": True,
        "description": "Advanced AI models for mental health analysis and recommendations"
    }

@app.post("/analyze", response_model=AnalysisResponse, responses={400: {"model": ErrorResponse}})
async def analyze_text(request: TextAnalysisRequest):
    """
    Analyze text with AI-powered sentiment analysis
    
    - **text**: The text to analyze (required, 10-5000 chars)
    - **user_id**: Optional user identifier
    - **session_id**: Optional session identifier
    - **language**: Language context
    
    Returns AI-generated analysis with personalized recommendations
    """
    try:
        logger.info(f"Analyzing text (length: {len(request.text)} chars)")
        logger.info(f"Language: {request.language}, Session: {request.session_id}")
        
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
        
        # Log first 100 chars for debugging (sanitized)
        preview = request.text[:100].replace('\n', ' ')
        logger.info(f"Text preview: {preview}...")
        
        # Perform analysis
        start_time = time.time()
        analysis_result = analyzer.analyze_text(request.text)
        analysis_time = time.time() - start_time
        
        logger.info(f"Analysis completed in {analysis_time:.2f} seconds")
        logger.info(f"Risk level: {analysis_result['risk_level']}, Score: {analysis_result['risk_score']}")
        
        # Determine next step based on risk level
        risk_level = analysis_result["risk_level"]
        if risk_level in ["CRITICAL", "HIGH"]:
            next_step = "🚨 URGENT: Seek immediate help from mental health resources. These feelings are treatable with professional support."
        elif risk_level == "MEDIUM":
            next_step = "✅ Recommended: Consider professional consultation. Early intervention can prevent escalation."
        else:
            next_step = "📊 You're managing well. Continue self-care practices and monitor your mental wellness."
        
        # Create resources object
        mental_health_resources = MentalHealthResources(
            emergency_helplines=analyzer.MENTAL_HEALTH_RESOURCES["emergency_helplines"],
            telemedicine_services=analyzer.MENTAL_HEALTH_RESOURCES["telemedicine_services"],
            government_resources=analyzer.MENTAL_HEALTH_RESOURCES["government_resources"],
            regional_support=analyzer.MENTAL_HEALTH_RESOURCES["regional_support"]
        )
        
        # Prepare context notes
        context_notes = []
        if analysis_result.get("analysis_summary"):
            context_notes.append(analysis_result["analysis_summary"])
        
        if analysis_result.get("warning_flags"):
            context_notes.extend(analysis_result["warning_flags"])
        
        if HF_AVAILABLE:
            context_notes.append(f"Sentiment analysis powered by {SENTIMENT_MODEL}")
            if hasattr(analyzer, 'chat_available') and analyzer.chat_available:
                context_notes.append(f"Recommendations powered by {TEXT_GEN_MODEL}")
        else:
            context_notes.append("Analysis based on keyword detection (AI models unavailable)")
        
        # Add performance note
        context_notes.append(f"Analysis completed in {analysis_time:.1f} seconds")
        
        # Add language note if not English
        if request.language and request.language != "english":
            context_notes.append(f"Note: Text analyzed as {request.language} content")
        
        # Create response
        response = AnalysisResponse(
            risk_level=risk_level,
            risk_score=analysis_result["risk_score"],
            confidence=analysis_result["confidence"],
            sentiment_scores=analysis_result["sentiment_scores"],
            detected_emotions=analysis_result["detected_emotions"],
            keywords_found=analysis_result["keywords_found"],
            recommendations=analysis_result["recommendations"],
            next_step=next_step,
            analysis_timestamp=datetime.now().isoformat(),
            session_id=request.session_id,
            model_used=analysis_result["model_used"],
            warning_flags=analysis_result.get("warning_flags", []),
            mental_health_resources=mental_health_resources,
            context_notes=context_notes
        )
        
        logger.info(f"Analysis complete - Risk: {risk_level} ({analysis_result['risk_score']:.1f})")
        logger.info(f"Model used: {analysis_result['model_used']}")
        logger.info(f"Recommendations generated: {len(analysis_result['recommendations'])}")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

@app.post("/test-models")
async def test_models():
    """Test endpoint to verify models are working"""
    try:
        test_text = "I feel anxious about the future but I'm trying to stay positive"
        
        # Test sentiment model
        sentiment_result = None
        if HF_AVAILABLE:
            try:
                sentiment_result = hf_client.text_classification(
                    test_text,
                    model=SENTIMENT_MODEL
                )
            except Exception as e:
                logger.error(f"Sentiment model test failed: {str(e)}")
        
        # Test chat model
        chat_result = None
        if HF_AVAILABLE and hasattr(analyzer, 'chat_available') and analyzer.chat_available:
            try:
                completion = analyzer.chat_client.chat.completions.create(
                    model=TEXT_GEN_MODEL,
                    messages=[
                        {"role": "user", "content": "Say hello in a friendly way"}
                    ],
                    max_tokens=50
                )
                chat_result = completion.choices[0].message.content
            except Exception as e:
                logger.error(f"Chat model test failed: {str(e)}")
        
        return {
            "status": "test_completed",
            "sentiment_model": {
                "name": SENTIMENT_MODEL,
                "working": sentiment_result is not None,
                "test_output": str(sentiment_result) if sentiment_result else None
            },
            "chat_model": {
                "name": TEXT_GEN_MODEL,
                "working": chat_result is not None,
                "test_output": chat_result
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Model test error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Model test failed: {str(e)}")

# ==================== Main Execution ====================
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Mental Health Analysis API")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind to")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload")
    parser.add_argument("--test", action="store_true", help="Run quick test and exit")
    
    args = parser.parse_args()
    
    if args.test:
        # Quick test
        print(f"Hugging Face Available: {HF_AVAILABLE}")
        print(f"Sentiment Model: {SENTIMENT_MODEL}")
        print(f"Text Gen Model: {TEXT_GEN_MODEL}")
        print(f"Chat Client Available: {hasattr(analyzer, 'chat_available') and analyzer.chat_available}")
        
        test_cases = [
            "I'm feeling anxious about my exams and future",
            "I feel hopeless and don't see any point in continuing",
            "I'm happy and excited about my new job opportunity",
            "Sometimes I feel really down but I don't know why"
        ]
        
        for i, test_text in enumerate(test_cases, 1):
            print(f"\n{'='*60}")
            print(f"Test Case {i}: {test_text}")
            print(f"Length: {len(test_text)} chars")
            
            try:
                result = analyzer.analyze_text(test_text)
                print(f"Risk Level: {result['risk_level']}")
                print(f"Risk Score: {result['risk_score']}")
                print(f"Model Used: {result['model_used']}")
                print(f"Sentiment: {result['sentiment_scores']['overall']}")
                print(f"Emotions: {', '.join(result['detected_emotions'])}")
                print(f"Recommendations:")
                for j, rec in enumerate(result['recommendations'], 1):
                    print(f"  {j}. {rec}")
            except Exception as e:
                print(f"Test failed: {str(e)}")
        
        print(f"\n{'='*60}")
        print("Test completed!")
    else:
        uvicorn.run(
            "main:app",
            host=args.host,
            port=args.port,
            reload=args.reload,
            log_level="info",
            access_log=True
        )