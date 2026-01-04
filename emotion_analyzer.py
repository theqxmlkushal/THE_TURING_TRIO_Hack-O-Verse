import cv2
import mediapipe as mp
from transformers import pipeline
from PIL import Image
import numpy as np

class EmotionDetector:
    def __init__(self):
        print("Initializing EmotionDetector...")
        # Initialize MediaPipe Face Detection
        self.mp_face_detection = mp.solutions.face_detection
        self.face_detection = self.mp_face_detection.FaceDetection(min_detection_confidence=0.5)
        
        # Initialize Hugging Face Emotion Classification Pipeline
        # Using a model fine-tuned for facial emotion recognition
        print("Loading Hugging Face model...")
        self.emotion_classifier = pipeline(
            "image-classification", 
            model="dima806/facial_emotions_image_detection"
        )
        print("Models loaded successfully.")

    def process_video(self, video_path, frame_skip=10):
        """
        Processes a video file to detect emotions.
        
        Args:
            video_path: Path to the video file.
            frame_skip: Number of frames to skip to speed up processing.
            
        Returns:
            List of dictionaries containing timestamp and detected emotion.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS)
        results_timeline = []
        frame_count = 0

        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break
            
            # Process only every n-th frame
            if frame_count % frame_skip != 0:
                frame_count += 1
                continue

            # Convert frame to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Detect faces
            detection_results = self.face_detection.process(rgb_frame)

            if detection_results.detections:
                for detection in detection_results.detections:
                    # Get bounding box
                    bboxC = detection.location_data.relative_bounding_box
                    ih, iw, _ = frame.shape
                    x, y, w, h = int(bboxC.xmin * iw), int(bboxC.ymin * ih), int(bboxC.width * iw), int(bboxC.height * ih)
                    
                    # Ensure bounding box is within frame limits
                    x, y = max(0, x), max(0, y)
                    w, h = min(iw - x, w), min(ih - y, h)
                    
                    if w > 0 and h > 0:
                        # Crop face
                        face_img = rgb_frame[y:y+h, x:x+w]
                        pil_image = Image.fromarray(face_img)

                        # Predict emotion
                        try:
                            predictions = self.emotion_classifier(pil_image)
                            # predictions is a list of dicts like [{'label': 'happy', 'score': 0.99}, ...]
                            # Get the top prediction
                            top_emotion = max(predictions, key=lambda x: x['score'])
                            
                            timestamp = frame_count / fps
                            results_timeline.append({
                                "timestamp": round(timestamp, 2),
                                "emotion": top_emotion['label'],
                                "score": round(top_emotion['score'], 4),
                                "all_predictions": predictions
                            })
                        except Exception as e:
                            print(f"Error classifying face at frame {frame_count}: {e}")
                        
                        # We only process the first face found in the frame for now
                        break
            
            frame_count += 1

        cap.release()
        return results_timeline

if __name__ == "__main__":
    # Test block
    detector = EmotionDetector()
    print("Detector initialized. Ready to process.")
