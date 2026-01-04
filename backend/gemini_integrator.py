# gemini_integrator.py - Google Gemini API Integration for Final Recommendations
import os
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from dotenv import load_dotenv
import google.generativeai as genai
import json

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiIntegrator:
    """Integrates with Google Gemini API for personalized mental health recommendations"""
    
    def __init__(self):
        self.initialized = False
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        if not self.gemini_api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables")
            return
        
        try:
            # Configure Gemini
            genai.configure(api_key=self.gemini_api_key)
            
            # Initialize model
            self.model = genai.GenerativeModel('gemini-2.5.flash')
            
            self.initialized = True
            logger.info("Gemini AI Integrator initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {str(e)}")
            self.initialized = False
    
    def generate_recommendations(
        self,
        overall_risk_score: float,
        overall_risk_level: str,
        text_analysis: Optional[Dict] = None,
        audio_analysis: Optional[Dict] = None,
        video_analysis: Optional[Dict] = None,
        combined_emotions: List[str] = None
    ) -> Dict[str, Any]:
        """
        Generate personalized recommendations using Gemini AI
        based on combined analysis from all modalities
        """
        
        if not self.initialized:
            logger.warning("Gemini not initialized, returning fallback recommendations")
            return self._get_fallback_response(overall_risk_level)
        
        try:
            # Build context for Gemini
            context = self._build_context(
                overall_risk_score,
                overall_risk_level,
                text_analysis,
                audio_analysis,
                video_analysis,
                combined_emotions
            )
            
            # Create prompt
            prompt = f"""You are a compassionate mental health AI assistant analyzing a person's emotional state based on multiple data sources.

ANALYSIS SUMMARY:
{context}

Based on this comprehensive analysis, provide:

1. **Top 3 Personalized Recommendations** (practical, actionable, empathetic)
2. **Personalized Advice** (2-3 paragraphs of compassionate guidance considering their specific situation)

Guidelines:
- Be empathetic and supportive
- Provide specific, actionable advice
- Consider the severity ({overall_risk_level} risk)
- If HIGH or CRITICAL risk, emphasize professional help
- Be culturally sensitive
- Avoid medical diagnosis
- Keep recommendations practical and achievable

Format your response as JSON:
{{
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "personalized_advice": "Your detailed personalized advice here..."
}}
"""
            
            logger.info("Sending request to Gemini API...")
            
            # Generate response
            response = self.model.generate_content(prompt)
            
            # Parse response
            response_text = response.text.strip()
            
            # Try to extract JSON from response
            try:
                # Remove markdown code blocks if present
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0].strip()
                elif "```" in response_text:
                    response_text = response_text.split("```")[1].split("```")[0].strip()
                
                result = json.loads(response_text)
                
                recommendations = result.get("recommendations", [])[:3]
                personalized_advice = result.get("personalized_advice", "")
                
                logger.info("Successfully generated Gemini recommendations")
                
                return {
                    "recommendations": recommendations,
                    "personalized_advice": personalized_advice,
                    "source": "Google Gemini AI",
                    "timestamp": datetime.now().isoformat()
                }
                
            except json.JSONDecodeError:
                # Fallback parsing
                logger.warning("Failed to parse JSON from Gemini, using text parsing")
                return self._parse_text_response(response_text, overall_risk_level)
            
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return self._get_fallback_response(overall_risk_level)
    
    def _build_context(
        self,
        overall_risk_score: float,
        overall_risk_level: str,
        text_analysis: Optional[Dict],
        audio_analysis: Optional[Dict],
        video_analysis: Optional[Dict],
        combined_emotions: List[str]
    ) -> str:
        """Build context string for Gemini"""
        
        context_parts = [
            f"Overall Risk Score: {overall_risk_score:.1f}/100",
            f"Overall Risk Level: {overall_risk_level}",
            f"Detected Emotions: {', '.join(combined_emotions) if combined_emotions else 'None'}"
        ]
        
        if text_analysis:
            context_parts.append(f"\nTEXT ANALYSIS:")
            context_parts.append(f"- Risk: {text_analysis.get('risk_level')} ({text_analysis.get('risk_score')}/100)")
            context_parts.append(f"- Emotions: {', '.join(text_analysis.get('detected_emotions', []))}")
            context_parts.append(f"- Keywords: {', '.join(text_analysis.get('keywords_found', [])[:5])}")
            
            if text_analysis.get('warning_flags'):
                context_parts.append(f"- Warnings: {'; '.join(text_analysis['warning_flags'])}")
        
        if audio_analysis:
            context_parts.append(f"\nAUDIO ANALYSIS:")
            context_parts.append(f"- Risk: {audio_analysis.get('risk_level')} ({audio_analysis.get('risk_score')}/100)")
            context_parts.append(f"- Primary Emotion: {audio_analysis.get('primary_emotion')}")
            context_parts.append(f"- Confidence: {audio_analysis.get('confidence', 0):.2f}")
        
        if video_analysis and video_analysis.get('status') == 'success':
            summary = video_analysis.get('summary', {})
            context_parts.append(f"\nVIDEO ANALYSIS:")
            context_parts.append(f"- Most Frequent Emotion: {summary.get('most_frequent_emotion')}")
            
            emotion_dist = summary.get('emotion_distribution', {})
            if emotion_dist:
                top_emotions = sorted(emotion_dist.items(), key=lambda x: x[1], reverse=True)[:3]
                context_parts.append(f"- Emotion Distribution: {', '.join([f'{e}:{p}%' for e, p in top_emotions])}")
            
            context_parts.append(f"- Emotional Stability: {summary.get('emotional_stability', 0):.2f}")
        
        return "\n".join(context_parts)
    
    def _parse_text_response(self, response_text: str, risk_level: str) -> Dict[str, Any]:
        """Parse text response when JSON parsing fails"""
        
        recommendations = []
        personalized_advice = ""
        
        lines = response_text.split('\n')
        in_recommendations = False
        in_advice = False
        
        for line in lines:
            line = line.strip()
            
            if 'recommendation' in line.lower() and ':' not in line:
                in_recommendations = True
                in_advice = False
                continue
            
            if 'advice' in line.lower() or 'guidance' in line.lower():
                in_recommendations = False
                in_advice = True
                continue
            
            if in_recommendations and line and len(recommendations) < 3:
                # Clean up line
                rec = line.lstrip('123456789.-*• ')
                if len(rec) > 15:
                    recommendations.append(rec)
            
            if in_advice and line:
                personalized_advice += line + " "
        
        if not recommendations:
            recommendations = self._get_fallback_recommendations(risk_level)
        
        if not personalized_advice:
            personalized_advice = self._get_fallback_advice(risk_level)
        
        return {
            "recommendations": recommendations[:3],
            "personalized_advice": personalized_advice.strip(),
            "source": "Google Gemini AI (parsed)",
            "timestamp": datetime.now().isoformat()
        }
    
    def _get_fallback_response(self, risk_level: str) -> Dict[str, Any]:
        """Fallback response when Gemini is unavailable"""
        
        return {
            "recommendations": self._get_fallback_recommendations(risk_level),
            "personalized_advice": self._get_fallback_advice(risk_level),
            "source": "Fallback System",
            "timestamp": datetime.now().isoformat()
        }
    
    def _get_fallback_recommendations(self, risk_level: str) -> List[str]:
        """Fallback recommendations"""
        
        recommendations = {
            "LOW": [
                "Practice daily mindfulness meditation for 10-15 minutes to maintain emotional balance",
                "Maintain a consistent sleep schedule of 7-8 hours and engage in regular physical activity",
                "Build and nurture supportive relationships with friends and family"
            ],
            "MEDIUM": [
                "Schedule a consultation with a licensed mental health professional for proper assessment",
                "Implement structured stress management techniques like deep breathing and progressive muscle relaxation",
                "Consider joining online or in-person support groups to connect with others facing similar challenges"
            ],
            "HIGH": [
                "Urgently contact a mental health professional for immediate assessment and intervention",
                "Develop a comprehensive safety plan with crisis contacts and coping strategies",
                "Ensure you're not isolated - stay connected with trusted friends or family members daily"
            ],
            "CRITICAL": [
                "🚨 IMMEDIATE ACTION REQUIRED: Call a crisis helpline or go to the nearest emergency department",
                "🚨 Do not remain alone - contact a trusted person or emergency services immediately",
                "🚨 Remove access to any means of self-harm and follow emergency safety protocols"
            ]
        }
        
        return recommendations.get(risk_level, recommendations["MEDIUM"])
    
    def _get_fallback_advice(self, risk_level: str) -> str:
        """Fallback personalized advice"""
        
        advice = {
            "LOW": """Your analysis indicates you're managing relatively well emotionally. Continue practicing self-care 
and maintaining healthy habits. It's important to stay mindful of your emotional state and address any concerns 
early. Consider journaling, regular exercise, and maintaining social connections as preventive measures. Remember 
that seeking support is always a sign of strength, not weakness.""",
            
            "MEDIUM": """Your emotional state suggests you could benefit from additional support. While you're experiencing 
some challenges, early intervention can prevent escalation. Consider reaching out to a mental health professional 
who can provide personalized guidance. In the meantime, focus on stress reduction techniques, maintain your support 
network, and be gentle with yourself. Remember that what you're feeling is valid and help is available.""",
            
            "HIGH": """Your analysis indicates significant emotional distress that requires professional attention. Please 
prioritize seeking help from a qualified mental health professional soon. Your feelings are important and treatable 
with proper support. In the immediate term, ensure you're not isolating yourself and have people you can reach out 
to. Create a safety plan and keep crisis resources readily available. You don't have to face this alone.""",
            
            "CRITICAL": """URGENT: Your analysis indicates a critical level of distress requiring immediate professional 
intervention. Please contact emergency services or a crisis helpline right now. What you're experiencing is serious 
but treatable with proper professional help. Do not stay alone - reach out to someone you trust immediately or go 
to the nearest emergency department. Your life is valuable and help is available 24/7. This is a medical emergency 
that requires immediate attention."""
        }
        
        return advice.get(risk_level, advice["MEDIUM"])
    
    def test_connection(self) -> Dict[str, Any]:
        """Test Gemini API connection"""
        
        if not self.initialized:
            return {
                "success": False,
                "error": "Gemini not initialized",
                "message": "GEMINI_API_KEY not found or invalid"
            }
        
        try:
            # Simple test prompt
            response = self.model.generate_content("Say 'Hello' if you can hear me.")
            
            return {
                "success": True,
                "message": "Gemini API connection successful",
                "response": response.text[:100]
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to connect to Gemini API"
            }
