# video_analyzer.py - Video Emotion Detection Module
import cv2
import mediapipe as mp
import numpy as np
from PIL import Image
import logging
from typing import List, Dict, Optional, Tuple
import tempfile
import os
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoEmotionDetector:
    def __init__(self, use_hf_model: bool = True):
        logger.info("Initializing VideoEmotionDetector...")
        self.use_hf_model = use_hf_model
        
        try:
            # Initialize MediaPipe Face Detection
            self.mp_face_detection = mp.solutions.face_detection
            self.face_detection = self.mp_face_detection.FaceDetection(
                model_selection=1,
                min_detection_confidence=0.5
            )
            
            # Initialize Hugging Face emotion model if requested
            self.emotion_classifier = None
            if use_hf_model:
                try:
                    from transformers import pipeline
                    logger.info("Loading Hugging Face facial emotion model...")
                    self.emotion_classifier = pipeline(
                        "image-classification", 
                        model="dima806/facial_emotions_image_detection",
                        device=-1  # Use CPU
                    )
                    logger.info("Hugging Face emotion model loaded successfully")
                except Exception as e:
                    logger.warning(f"Failed to load Hugging Face model: {str(e)}")
                    logger.info("Falling back to MediaPipe emotion approximation")
                    self.use_hf_model = False
            
            # Initialize MediaPipe Face Mesh as fallback
            self.mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            
            # Emotion mapping
            self.EMOTION_MAP = {
                'angry': 'anger',
                'disgust': 'disgust',
                'fear': 'fear',
                'happy': 'happy',
                'sad': 'sadness',
                'surprise': 'surprise',
                'neutral': 'neutral',
                'contempt': 'contempt'
            }
            
            logger.info("Video Emotion Detector initialized successfully")
            self.initialized = True
            
        except Exception as e:
            logger.error(f"Failed to initialize VideoEmotionDetector: {str(e)}")
            self.initialized = False
            raise

    def _detect_emotion_hf(self, face_image: np.ndarray) -> Tuple[str, float, List[Dict]]:
        """Detect emotion using Hugging Face model"""
        if not self.emotion_classifier:
            return "neutral", 0.5, []
        
        try:
            pil_image = Image.fromarray(face_image)
            predictions = self.emotion_classifier(pil_image)
            
            if predictions:
                top_prediction = predictions[0]
                emotion = self.EMOTION_MAP.get(top_prediction['label'].lower(), top_prediction['label'])
                confidence = top_prediction['score']
                
                top_predictions = []
                for pred in predictions[:3]:
                    top_predictions.append({
                        'emotion': self.EMOTION_MAP.get(pred['label'].lower(), pred['label']),
                        'confidence': float(pred['score'])
                    })
                
                return emotion, confidence, top_predictions
        
        except Exception as e:
            logger.warning(f"HF emotion detection failed: {str(e)}")
        
        return "neutral", 0.5, []

    def _approximate_emotion_from_landmarks(self, landmarks) -> Tuple[str, float]:
        """Approximate emotion based on facial landmarks"""
        try:
            mouth_upper = landmarks[13].y
            mouth_lower = landmarks[14].y
            mouth_openness = abs(mouth_upper - mouth_lower)
            
            left_eyebrow = landmarks[70].y
            right_eyebrow = landmarks[300].y
            avg_eyebrow = (left_eyebrow + right_eyebrow) / 2
            
            left_eye_upper = landmarks[159].y
            left_eye_lower = landmarks[145].y
            right_eye_upper = landmarks[386].y
            right_eye_lower = landmarks[374].y
            avg_eye_openness = (abs(left_eye_upper - left_eye_lower) + abs(right_eye_upper - right_eye_lower)) / 2
            
            if mouth_openness > 0.04:
                return "surprise", 0.7
            elif avg_eyebrow < 0.25:
                return "anger", 0.6
            elif mouth_upper > 0.6 and mouth_lower > 0.6:
                return "sadness", 0.6
            elif avg_eye_openness < 0.02:
                return "happy", 0.6
            elif mouth_openness < 0.01:
                return "neutral", 0.5
            else:
                return "neutral", 0.5
                
        except Exception as e:
            logger.warning(f"Landmark emotion approximation failed: {str(e)}")
            return "neutral", 0.5

    def _detect_face_orientation(self, landmarks) -> Dict[str, float]:
        """Detect face orientation"""
        try:
            nose_tip = landmarks[1]
            left_eye = landmarks[33]
            right_eye = landmarks[263]
            
            eye_center_x = (left_eye.x + right_eye.x) / 2
            yaw = nose_tip.x - eye_center_x
            
            eye_center_y = (left_eye.y + right_eye.y) / 2
            pitch = nose_tip.y - eye_center_y
            
            roll = np.arctan2(right_eye.y - left_eye.y, right_eye.x - left_eye.x)
            
            return {
                'pitch': float(pitch),
                'yaw': float(yaw),
                'roll': float(roll)
            }
        except Exception:
            return {'pitch': 0.0, 'yaw': 0.0, 'roll': 0.0}

    def process_video(self, video_path: str, frame_skip: int = 15, max_frames: int = 300):
        """Process video file to detect emotions"""
        if not self.initialized:
            raise RuntimeError("VideoEmotion Detector not properly initialized")
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0
        
        logger.info(f"Processing video: {video_path}")
        logger.info(f"FPS: {fps}, Total frames: {total_frames}, Duration: {duration:.2f}s")
        logger.info(f"Processing settings: frame_skip={frame_skip}, max_frames={max_frames}")
        
        results_timeline = []
        frame_count = 0
        processed_frames = 0
        total_processing_time = 0

        try:
            while cap.isOpened() and processed_frames < max_frames:
                success, frame = cap.read()
                if not success:
                    break
                
                if frame_count % frame_skip != 0:
                    frame_count += 1
                    continue

                start_time = time.time()
                
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                detection_results = self.face_detection.process(rgb_frame)

                if detection_results.detections:
                    for detection in detection_results.detections:
                        bboxC = detection.location_data.relative_bounding_box
                        ih, iw, _ = frame.shape
                        x = int(bboxC.xmin * iw)
                        y = int(bboxC.ymin * ih)
                        w = int(bboxC.width * iw)
                        h = int(bboxC.height * ih)
                        
                        expansion = 0.2
                        x = max(0, int(x - w * expansion))
                        y = max(0, int(y - h * expansion))
                        w = min(iw - x, int(w * (1 + 2 * expansion)))
                        h = min(ih - y, int(h * (1 + 2 * expansion)))
                        
                        if w > 40 and h > 40:
                            face_img = rgb_frame[y:y+h, x:x+w]
                            
                            emotion = "neutral"
                            confidence = 0.5
                            all_predictions = []
                            
                            if self.use_hf_model and self.emotion_classifier:
                                emotion, confidence, all_predictions = self._detect_emotion_hf(face_img)
                                detection_method = "hugging_face"
                            else:
                                face_mesh_results = self.face_mesh.process(face_img)
                                
                                if face_mesh_results.multi_face_landmarks:
                                    landmarks = face_mesh_results.multi_face_landmarks[0].landmark
                                    emotion, confidence = self._approximate_emotion_from_landmarks(landmarks)
                                    orientation = self._detect_face_orientation(landmarks)
                                    detection_method = "mediapipe"
                                    
                                    all_predictions = [{
                                        'emotion': emotion,
                                        'confidence': confidence
                                    }]
                                else:
                                    detection_method = "face_detection_only"
                            
                            timestamp = frame_count / fps if fps > 0 else 0
                            
                            results_timeline.append({
                                "timestamp": round(timestamp, 2),
                                "emotion": emotion,
                                "confidence": round(confidence, 4),
                                "bounding_box": {
                                    "x": x, "y": y, 
                                    "width": w, "height": h
                                },
                                "frame": frame_count,
                                "detection_method": detection_method,
                                "all_predictions": all_predictions[:3]
                            })
                            processed_frames += 1
                        
                        break
                
                frame_count += 1
                total_processing_time += time.time() - start_time
                
                if frame_count % 100 == 0:
                    logger.info(f"Processed {frame_count}/{total_frames} frames...")
                    
        except Exception as e:
            logger.error(f"Error processing video: {str(e)}")
            raise
        finally:
            cap.release()
            logger.info(f"Video processing complete. Processed {processed_frames} frames in {total_processing_time:.2f}s.")
        
        return self._generate_summary(results_timeline, duration, total_processing_time)

    def _generate_summary(self, timeline: List[Dict], duration: float, processing_time: float):
        """Generate summary statistics"""
        if not timeline:
            return {
                "status": "no_faces_detected",
                "message": "No faces were detected in the video.",
                "timeline": [],
                "summary": {},
                "duration": round(duration, 2),
                "processing_time": round(processing_time, 2),
                "model_used": "dima806/facial_emotions_image_detection" if self.use_hf_model else "mediapipe_approximation"
            }
        
        emotion_counts = {}
        emotion_confidences = {}
        
        for entry in timeline:
            emotion = entry['emotion']
            confidence = entry['confidence']
            
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
            if emotion not in emotion_confidences:
                emotion_confidences[emotion] = []
            emotion_confidences[emotion].append(confidence)
        
        most_frequent = max(emotion_counts.items(), key=lambda x: x[1]) if emotion_counts else ("neutral", 0)
        
        avg_confidences = {}
        for emotion, confs in emotion_confidences.items():
            avg_confidences[emotion] = round(sum(confs) / len(confs), 3)
        
        total_entries = len(timeline)
        emotion_percentages = {}
        for emotion, count in emotion_counts.items():
            emotion_percentages[emotion] = round((count / total_entries) * 100, 1)
        
        emotion_transitions = []
        previous_emotion = None
        for entry in timeline:
            if previous_emotion != entry['emotion']:
                if previous_emotion is not None:
                    emotion_transitions.append({
                        "from": previous_emotion,
                        "to": entry['emotion'],
                        "timestamp": entry['timestamp']
                    })
                previous_emotion = entry['emotion']
        
        stability_score = 1.0 - (len(emotion_transitions) / max(1, len(timeline)))
        dominant_emotion = most_frequent[0] if most_frequent[1] / total_entries > 0.5 else "mixed"
        
        return {
            "status": "success",
            "total_frames_analyzed": len(timeline),
            "duration": round(duration, 2),
            "processing_time": round(processing_time, 2),
            "model_used": "dima806/facial_emotions_image_detection" if self.use_hf_model else "mediapipe_approximation",
            "summary": {
                "most_frequent_emotion": most_frequent[0],
                "emotion_distribution": emotion_percentages,
                "average_confidences": avg_confidences,
                "emotional_stability": round(stability_score, 3),
                "dominant_emotion": dominant_emotion,
                "emotion_transitions": len(emotion_transitions),
                "unique_emotions": len(emotion_counts)
            },
            "timeline": timeline[:100],
            "emotion_transitions": emotion_transitions[:10],
            "analysis_notes": [
                f"Analyzed {len(timeline)} frames with faces",
                f"Detected {len(emotion_counts)} different emotions",
                f"Most common emotion: {most_frequent[0]} ({most_frequent[1]} occurrences, {emotion_percentages.get(most_frequent[0], 0)}%)",
                f"Emotional stability: {stability_score:.1%}",
                f"Processing speed: {len(timeline)/processing_time:.1f} fps" if processing_time > 0 else "Processing speed: N/A"
            ]
        }

    def cleanup(self):
        """Clean up resources"""
        try:
            if hasattr(self, 'face_detection'):
                self.face_detection.close()
            if hasattr(self, 'face_mesh'):
                self.face_mesh.close()
            logger.info("VideoEmotionDetector resources cleaned up")
        except Exception as e:
            logger.warning(f"Error during cleanup: {str(e)}")
