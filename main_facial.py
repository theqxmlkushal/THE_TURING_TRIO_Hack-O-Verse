from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime
import os
import tempfile
import time

from deepface import DeepFace

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Facial Expression Recognition API",
    description="Detect facial expressions and return emotion scores and simple guidance",
    version="1.0.0"
)


class ImageAnalysisRequest(BaseModel):
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    image_url: Optional[str] = None


class ImageAnalysisResponse(BaseModel):
    dominant_emotion: str
    emotions: Dict[str, float]
    face_count: int
    confidence: float
    risk_level: str
    recommendations: List[str]
    analysis_timestamp: str
    session_id: Optional[str] = None
    model_used: str


def map_emotion_to_risk(dominant: str, emotions: Dict[str, float]) -> str:
    # Simple heuristic mapping
    critical_emotions = ["fear", "sadness", "angry"]
    score = emotions.get(dominant, 0)
    if dominant.lower() in critical_emotions and score >= 60:
        return "HIGH"
    if dominant.lower() in ["sadness", "fear"] and score >= 40:
        return "MEDIUM"
    return "LOW"


def get_recommendations_for_emotion(risk_level: str) -> List[str]:
    if risk_level == "HIGH":
        return [
            "If you feel unsafe, seek immediate help or contact local emergency services.",
            "Reach out to a trusted person and let them know how you're feeling.",
            "Consider contacting a mental health professional or helpline for urgent support."
        ]
    if risk_level == "MEDIUM":
        return [
            "Try grounding techniques: slow breaths and notice 5 things around you.",
            "Talk to a friend or family member about what you're feeling.",
            "Consider scheduling a consultation with a counselor or therapist."
        ]
    return [
        "Keep monitoring how you feel and practice self-care (sleep, hydration, movement).",
        "Try simple relaxation exercises like deep breathing for 5 minutes.",
        "If things change, consider reaching out for support early."
    ]


@app.get("/")
async def root():
    return {"message": "Facial Expression Recognition API", "version": "1.0.0"}


@app.post("/analyze_image", response_model=ImageAnalysisResponse)
async def analyze_image(request: ImageAnalysisRequest = None, file: UploadFile = File(None)):
    """Analyze an uploaded image (or image URL) for facial expressions.

    - Provide a multipart/form-data `file` (image) or a JSON body with `image_url`.
    """
    start = time.time()

    if request is None:
        request = ImageAnalysisRequest()

    if (not file) and (not request.image_url):
        raise HTTPException(status_code=400, detail="Provide an uploaded image file or image_url")

    temp_path = None
    try:
        if file:
            contents = await file.read()
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
            tmp.write(contents)
            tmp.flush()
            tmp.close()
            temp_path = tmp.name
            img_path = temp_path
        else:
            # Let DeepFace download the URL directly
            img_path = request.image_url

        # Use DeepFace to analyze emotions
        # actions=['emotion'] returns a dict containing 'emotion' scores and 'dominant_emotion'
        logger.info(f"Analyzing image: {img_path}")
        analysis = DeepFace.analyze(img_path=img_path, actions=["emotion"], enforce_detection=False)

        # DeepFace returns a list when multiple faces detected; normalize
        if isinstance(analysis, list):
            face_count = len(analysis)
            first = analysis[0]
        else:
            face_count = 1
            first = analysis

        emotions = first.get("emotion", {})
        dominant = first.get("dominant_emotion", "neutral")

        # Compute a simple confidence: max emotion score divided by 100
        confidence = max(emotions.values()) / 100.0 if emotions else 0.0

        risk_level = map_emotion_to_risk(dominant, emotions)
        recommendations = get_recommendations_for_emotion(risk_level)

        response = {
            "dominant_emotion": dominant,
            "emotions": {k: round(float(v), 2) for k, v in emotions.items()},
            "face_count": face_count,
            "confidence": round(confidence, 2),
            "risk_level": risk_level,
            "recommendations": recommendations,
            "analysis_timestamp": datetime.now().isoformat(),
            "session_id": request.session_id,
            "model_used": "DeepFace (emotion)"
        }

        logger.info(f"Analysis done in {time.time()-start:.2f}s - Dominant: {dominant}")
        return response

    except Exception as e:
        logger.error(f"Image analysis error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


if __name__ == "__main__":
    import argparse, uvicorn

    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8001)
    parser.add_argument("--reload", action="store_true")
    args = parser.parse_args()

    uvicorn.run("main_facial:app", host=args.host, port=args.port, reload=args.reload)
