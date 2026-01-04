# THE_TURING_TRIO_Hack-O-Verse
The Turing Trio is team of Three AIML Enthusiasts focused on high-precision engineering and neural innovation. Inspired by the pioneers of computation, we solve complex problems through optimized algorithms and deep learning architectures.

---

# Video Emotion Recognition Backend

A FastAPI backend that analyzes facial emotions in videos using MediaPipe for face detection and a Fine-tuned Vision Transformer (ViT) for emotion classification.

## Features
- **FastAPI Endpoints**: High-performance async API.
- **MediaPipe Face Detection**: Lightweight and robust face cropping.
- **Hugging Face Transformers**: Uses `dima806/facial_emotions_image_detection` for State-of-the-Art emotion recognition.
- **Video Processing**: Supports `.mp4` and other video formats.

## Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/theqxmlkushal/THE_TURING_TRIO_Hack-O-Verse.git
    cd THE_TURING_TRIO_Hack-O-Verse
    ```

2.  **Install Dependencies**:
    > **Note**: Pinning `numpy<2.0.0` and `protobuf<4.0.0` is critical for MediaPipe compatibility.
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the Server**:
    ```bash
    python -m uvicorn main:app --reload
    ```

## Usage
- Open Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- POST to `/analyze_video` with a video file.
