# 🧠 Integrated Mental Health Analysis API

**Complete AI-powered backend for mental health assessment using Text, Audio, and Video analysis**

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

---

## 🎯 Overview

This is a **production-ready FastAPI backend** that integrates three AI models for comprehensive mental health analysis:

- **Text Analysis**: Sentiment + Risk assessment using Hugging Face
- **Audio Analysis**: Emotion recognition from speech  
- **Video Analysis**: Facial emotion detection
- **AI Recommendations**: Personalized advice using Google Gemini

All three analyses are combined to provide a holistic mental health risk score with AI-generated recommendations.

### Models Used

| Type | Model | Purpose |
|------|-------|---------|
| Text Sentiment | `tabularisai/multilingual-sentiment-analysis` | Analyze text sentiment |
| Text Recommendations | `meta-llama/Llama-3.1-8B-Instruct` | Generate text recommendations |
| Audio Emotion | `firdhokk/speech-emotion-recognition-whisper-v3` | Recognize emotions from speech |
| Video Emotion | `dima806/facial_emotions_image_detection` | Detect facial emotions |
| AI Integration | Google Gemini Pro | Final personalized recommendations |

---

## ✨ Features

- ✅ **Multi-modal Analysis**: Text, Audio, and Video in one API
- ✅ **Combined Risk Assessment**: Average risk score from all modalities
- ✅ **AI-Powered Recommendations**: Personalized advice from Gemini
- ✅ **Real-time Processing**: Fast analysis with efficient models
- ✅ **Comprehensive Logging**: Detailed logs for debugging
- ✅ **Interactive Documentation**: Built-in Swagger UI
- ✅ **Health Monitoring**: Endpoint to check system status
- ✅ **Emergency Resources**: Mental health helpline numbers included
- ✅ **Cross-platform**: Works on Windows, Linux, and macOS

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.12** (3.12.7 recommended)
- **pip** (latest version)
- **Virtual environment** (recommended)

### 3-Step Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Edit .env and add your API keys

# 3. Run the server
python main.py
```

That's it! API will be available at **http://localhost:8000**

---

## 📦 Installation

### Step 1: Clone/Download Project

```bash
# Download all project files to a directory
mkdir mental-health-api
cd mental-health-api
# Copy all files here
```

### Step 2: Create Virtual Environment

**Windows:**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Upgrade pip

```bash
python -m pip install --upgrade pip
```

### Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

**⏱️ Installation Time**: 5-10 minutes (downloads ~2GB of packages)

### Windows-Specific Notes

If you encounter errors on Windows:

1. **Torch not found**: Let pip auto-select version
   ```powershell
   pip install torch --upgrade
   ```

2. **Tokenizers needs Rust**: Install pre-built wheel
   ```powershell
   pip install tokenizers --upgrade
   ```

3. **Audio processing errors**: Install ffmpeg
   - Download from: https://www.gyan.dev/ffmpeg/builds/
   - Add to PATH

4. **OpenCV DLL errors**: Install Visual C++ Redistributable
   - Download: https://aka.ms/vs/17/release/vc_redist.x64.exe

### Alternative: Use Conda (Easier on Windows)

```bash
conda create -n mental-health python=3.12
conda activate mental-health
conda install pytorch -c pytorch
pip install -r requirements.txt
```

---

## ⚙️ Configuration

### 1. Get API Keys

You need **2 API keys**:

#### Hugging Face Token (HF_TOKEN)
1. Go to https://huggingface.co/settings/tokens
2. Create new token (read permission)
3. Copy the token

#### Google Gemini API Key (GEMINI_API_KEY)
1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. Copy the key

### 2. Create .env File

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Required API Keys
HF_TOKEN=your_huggingface_token_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional Configuration
API_HOST=0.0.0.0
API_PORT=8000
MAX_AUDIO_SIZE_MB=50
MAX_DURATION_SECONDS=30
DEBUG=false
```

⚠️ **Important**: Never commit `.env` to version control!

---

## 🌐 API Endpoints

### Health & Info

```
GET  /              # API information
GET  /health        # Health check (all modules)
GET  /models        # Models information
```

### Individual Analysis

```
POST /analyze/text      # Analyze text sentiment
POST /analyze/audio     # Analyze audio emotions
POST /analyze/video     # Analyze video emotions
```

### Combined Analysis

```
POST /analyze/combined  # All-in-one with AI recommendations
```

### Interactive Documentation

```
GET  /docs          # Swagger UI (recommended)
GET  /redoc         # Alternative documentation
```

---

## 📘 Usage Examples

### 1. Text Analysis

**Request:**
```bash
curl -X POST "http://localhost:8000/analyze/text" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I have been feeling very stressed and anxious lately",
    "user_id": "user123",
    "session_id": "session456"
  }'
```

**Response:**
```json
{
  "risk_level": "MEDIUM",
  "risk_score": 45.5,
  "confidence": 0.85,
  "detected_emotions": ["anxiety", "stress"],
  "recommendations": [
    "Consider talking to a counselor",
    "Practice stress management techniques",
    "Reach out to supportive friends"
  ],
  "mental_health_resources": {...}
}
```

### 2. Audio Analysis

**Request:**
```bash
curl -X POST "http://localhost:8000/analyze/audio" \
  -F "file=@audio_sample.wav" \
  -F "user_id=user123"
```

**Response:**
```json
{
  "risk_level": "MEDIUM",
  "risk_score": 42.3,
  "primary_emotion": "sad",
  "emotion_scores": {
    "sad": 0.65,
    "neutral": 0.20,
    "fearful": 0.15
  },
  "recommendations": [...]
}
```

### 3. Video Analysis

**Request:**
```bash
curl -X POST "http://localhost:8000/analyze/video" \
  -F "file=@video_sample.mp4" \
  -F "frame_skip=10"
```

**Response:**
```json
{
  "status": "success",
  "total_frames_analyzed": 45,
  "summary": {
    "most_frequent_emotion": "sadness",
    "emotion_distribution": {
      "sadness": 45.5,
      "neutral": 30.2,
      "fear": 24.3
    },
    "emotional_stability": 0.65
  }
}
```

### 4. Combined Analysis (Recommended)

**Request:**
```bash
curl -X POST "http://localhost:8000/analyze/combined" \
  -F "text=I feel very anxious and stressed" \
  -F "audio_file=@audio.wav" \
  -F "video_file=@video.mp4" \
  -F "user_id=user123"
```

**Response:**
```json
{
  "overall_risk_level": "MEDIUM",
  "overall_risk_score": 43.8,
  "overall_confidence": 0.82,
  "combined_emotions": ["anxiety", "sadness", "stress", "fear"],
  "ai_recommendations": [
    "Based on your combined assessment, consider scheduling...",
    "Your stress levels suggest implementing daily...",
    "The emotional patterns indicate you would benefit from..."
  ],
  "personalized_advice": "Detailed personalized advice from Gemini AI...",
  "text_analysis": {...},
  "audio_analysis": {...},
  "video_analysis": {...},
  "emergency_resources": {
    "Vandrevala Foundation": "9999666555",
    "iCall": "+91-9152987821",
    ...
  }
}
```

### Python Client Example

```python
import requests

# Text analysis
response = requests.post(
    "http://localhost:8000/analyze/text",
    json={"text": "I feel anxious and overwhelmed"}
)

result = response.json()
print(f"Risk Level: {result['risk_level']}")
print(f"Risk Score: {result['risk_score']}")
print("\nRecommendations:")
for rec in result['recommendations']:
    print(f"  - {rec}")

# Combined analysis with files
with open('audio.wav', 'rb') as audio, open('video.mp4', 'rb') as video:
    response = requests.post(
        "http://localhost:8000/analyze/combined",
        files={
            'audio_file': audio,
            'video_file': video
        },
        data={
            'text': 'I feel stressed',
            'user_id': 'user123'
        }
    )
    
result = response.json()
print(f"\nOverall Risk: {result['overall_risk_level']}")
print(f"AI Advice: {result['personalized_advice'][:100]}...")
```

---

## 🧪 Testing

### Quick Health Check

```bash
curl http://localhost:8000/health
```

Expected output:
```json
{
  "status": "healthy",
  "modules": {
    "text_analyzer": {"available": true, "initialized": true},
    "audio_analyzer": {"available": true, "initialized": true},
    "video_analyzer": {"available": true, "initialized": true},
    "gemini_integrator": {"available": true, "initialized": true}
  }
}
```

### Run Test Suite

```bash
python test_api.py
```

This will test all endpoints and validate responses.

### Test Individual Modules

**Text:**
```bash
python -c "from text_analyzer import TextSentimentAnalyzer; a = TextSentimentAnalyzer(); print('✓ Text OK')"
```

**Audio:**
```bash
python -c "from audio_analyzer import AudioEmotionAnalyzer; a = AudioEmotionAnalyzer(); print('✓ Audio OK')"
```

**Video:**
```bash
python -c "from video_analyzer import VideoEmotionDetector; v = VideoEmotionDetector(); print('✓ Video OK')"
```

**Gemini:**
```bash
python -c "from gemini_integrator import GeminiIntegrator; g = GeminiIntegrator(); print('✓ Gemini OK')"
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Import Errors

**Error:** `ModuleNotFoundError: No module named 'X'`

**Solution:**
```bash
# Reinstall packages
pip install -r requirements.txt --force-reinstall

# Or install specific package
pip install <package_name>
```

#### 2. API Keys Not Working

**Error:** "HF_TOKEN not found" or "GEMINI_API_KEY not found"

**Solution:**
- Check `.env` file exists in project root
- Verify no typos in API keys
- No extra spaces or quotes around keys
- Restart the API after updating `.env`

#### 3. Port Already in Use

**Error:** `Address already in use`

**Solution:**

**Windows:**
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:8000 | xargs kill -9
```

Or run on different port:
```bash
python main.py --port 8080
```

#### 4. Video Processing Fails

**Error:** Error processing video files

**Solution:**
- **Windows**: Install ffmpeg from https://ffmpeg.org/download.html
- **Linux**: `sudo apt-get install ffmpeg`
- **Mac**: `brew install ffmpeg`

#### 5. Slow API Response

**Solutions:**
- Use smaller audio/video files
- Increase `frame_skip` parameter for videos (try 15 or 20)
- Check internet connection (for HF and Gemini API calls)
- Consider using GPU for faster processing

#### 6. Out of Memory

**Error:** MemoryError during analysis

**Solution:**
- Close other applications
- Process files one at a time
- Reduce video frame_skip parameter
- Keep audio files under 30 seconds

### Windows-Specific Issues

#### Tokenizers Compilation Error

If you see "Rust compiler not found":
```powershell
# Install pre-built wheel
pip install tokenizers --upgrade --force-reinstall
```

#### OpenCV DLL Error

Install Visual C++ Redistributable:
https://aka.ms/vs/17/release/vc_redist.x64.exe

### Getting Help

1. Check the error message carefully
2. Search error on Stack Overflow  
3. Check `/health` endpoint to see which modules failed
4. Enable debug mode: Set `DEBUG=true` in `.env`
5. Check logs for detailed error traces

---

## 📁 Project Structure

```
mental-health-api/
│
├── main.py                    # Main FastAPI application
├── text_analyzer.py           # Text sentiment analysis
├── audio_analyzer.py          # Audio emotion analysis
├── video_analyzer.py          # Video emotion detection
├── gemini_integrator.py       # Gemini AI integration
│
├── requirements.txt           # Python dependencies
├── .env.example              # Environment template
├── .env                      # Your API keys (create this)
│
├── README.md                 # This file
├── PROJECT_STRUCTURE.md      # Detailed code structure
├── test_api.py               # Test suite
│
├── quick_start.sh            # Setup script (Linux/Mac)
└── quick_start.bat           # Setup script (Windows)
```

### File Descriptions

| File | Purpose | Lines |
|------|---------|-------|
| `main.py` | FastAPI app, all endpoints, combined analysis | ~700 |
| `text_analyzer.py` | Text sentiment + risk assessment | ~400 |
| `audio_analyzer.py` | Audio emotion recognition | ~350 |
| `video_analyzer.py` | Facial emotion detection | ~300 |
| `gemini_integrator.py` | AI recommendations generator | ~250 |

---

## 🎯 Development

### Running in Development Mode

```bash
# Auto-reload on file changes
python main.py --reload
```

### Custom Port

```bash
python main.py --port 8080
```

### Debug Mode

Set in `.env`:
```env
DEBUG=true
```

### Adding New Features

1. Create new analyzer module
2. Import in `main.py`
3. Add endpoint in `main.py`
4. Update combined analysis logic
5. Test with `test_api.py`

---

## 🔒 Security & Privacy

- ✅ No data stored permanently
- ✅ Real-time analysis only
- ✅ API keys stored securely in `.env`
- ✅ CORS configurable (restrict in production)
- ✅ No logging of sensitive data

**Production Recommendations:**
- Use HTTPS (SSL/TLS)
- Implement rate limiting
- Add authentication (JWT, OAuth)
- Restrict CORS origins
- Regular security updates

---

## 🚨 Mental Health Resources

Emergency helplines included in API responses:

- **Vandrevala Foundation**: 9999666555
- **iCall**: +91-9152987821
- **AASRA**: 91-9820466726
- **SNEHA**: 044-24640050
- **National Mental Health Helpline**: 08046110007

---

## 📊 Performance

### Typical Response Times

- Text Analysis: 1-3 seconds
- Audio Analysis: 3-8 seconds (30sec audio)
- Video Analysis: 10-30 seconds (30sec video, frame_skip=10)
- Combined Analysis: 15-40 seconds

### Optimization Tips

1. Increase `frame_skip` for faster video processing
2. Limit audio/video duration
3. Use GPU for faster inference (if available)
4. Process files in parallel when using combined endpoint

---

## ⚠️ Disclaimer

**This API is for informational and research purposes only.** It should not replace professional mental health diagnosis or treatment. Always consult qualified mental health professionals for serious concerns.

---

## 🎓 Credits

Built with:
- FastAPI - Web framework
- Hugging Face - AI models
- Google Gemini - AI recommendations
- MediaPipe - Face detection
- librosa - Audio processing
- OpenCV - Video processing

---

## 📞 Support

For issues or questions:
1. Check this README
2. Visit `/docs` endpoint for API documentation
3. Run `/health` to check system status
4. Check logs for error details
5. Test individual modules

---

## 🎉 Quick Start Checklist

- [ ] Python 3.12 installed
- [ ] Virtual environment created
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] API keys obtained (HF_TOKEN, GEMINI_API_KEY)
- [ ] `.env` file created and configured
- [ ] Health check passes (`curl localhost:8000/health`)
- [ ] Can access documentation (`http://localhost:8000/docs`)
- [ ] Test suite passes (`python test_api.py`)

**Once all checked ✅, you're ready to start analyzing!**

---

**Version**: 3.0.0  
**Python**: 3.12  
**License**: Educational/Research Use  
**Last Updated**: January 2025