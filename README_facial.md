# Facial Expression Recognition API

This FastAPI service analyzes facial expressions (emotions) from an uploaded image or an image URL using DeepFace.

## Files added
- `main_facial.py` - FastAPI application with `/analyze_image` endpoint.
- `requirements_facial.txt` - Dependencies required to run the facial analysis service.
- `.env.example` - Example environment file (optional).

## Install
Create a virtual environment and install dependencies:

```bash
python -m venv .venv
.\.venv\Scripts\activate    # Windows
pip install -r requirements_facial.txt
```

Note: DeepFace will download model weights at first run. Installing `tensorflow-cpu` may be preferable on non-GPU machines.

## Run
Start the API (development):

```bash
uvicorn main_facial:app --reload --port 8001
```

## Usage
- POST `/analyze_image` - accepts multipart `file` upload or JSON with `image_url`.

Example using `curl` with file upload:

```bash
curl -X POST "http://localhost:8001/analyze_image" -F "file=@/path/to/photo.jpg"
```

Example using JSON with image URL (use a tool like `httpie` or Postman):

```json
{
  "image_url": "https://example.com/photo.jpg",
  "session_id": "abc123"
}
```

## Notes
- This is a minimal, ready-to-run API. Production use requires additional hardening, rate-limiting, input validation, and privacy considerations (images are sensitive).
- DeepFace's analysis can return multiple faces; this service returns the first face's emotions and a `face_count`.

## Questions
If you want the same structure and production readiness as your `main.py` mental-health text API (logging, env-driven model selection, more sophisticated risk mapping), tell me which features to copy and I will extend this service accordingly.
