from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import shutil
import os
import tempfile
from emotion_analyzer import EmotionDetector

app = FastAPI(title="Video Emotion Recognition API")

# Initialize the model once at startup
detector = None

@app.on_event("startup")
async def startup_event():
    global detector
    print("Starting up... Loading models.")
    detector = EmotionDetector()

@app.get("/")
def read_root():
    return {"message": "Video Emotion Recognition API is running."}

@app.post("/analyze_video")
async def analyze_video(file: UploadFile = File(...)):
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video.")

    # Save uploaded file to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        shutil.copyfileobj(file.file, temp_video)
        temp_video_path = temp_video.name

    try:
        # Process the video
        # Skip frames to optimize processing time (e.g. process every 15th frame)
        # For 30fps video, this means 2 analyzes per second.
        emotions = detector.process_video(temp_video_path, frame_skip=15)
        
        # Calculate aggregate stats
        if emotions:
            emotion_counts = {}
            for res in emotions:
                e = res['emotion']
                emotion_counts[e] = emotion_counts.get(e, 0) + 1
            
            most_freq_emotion = max(emotion_counts, key=emotion_counts.get)
            
            return JSONResponse(content={
                "status": "success",
                "summary": {
                    "most_frequent_emotion": most_freq_emotion,
                    "total_frames_analyzed": len(emotions)
                },
                "timeline": emotions
            })
        else:
            return JSONResponse(content={
                "status": "success",
                "message": "No faces/emotions detected in the video.",
                "timeline": []
            })
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up the temp file
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
