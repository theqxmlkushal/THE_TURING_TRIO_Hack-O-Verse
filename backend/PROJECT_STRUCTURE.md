# Project Structure

```
mental-health-api/
│
├── 📄 main.py                      # Main FastAPI application
│   ├── Endpoints:
│   │   ├── GET  /                  # API info
│   │   ├── GET  /health            # Health check
│   │   ├── GET  /models            # Models information
│   │   ├── POST /analyze/text      # Text analysis
│   │   ├── POST /analyze/audio     # Audio analysis
│   │   ├── POST /analyze/video     # Video analysis
│   │   └── POST /analyze/combined  # Combined analysis
│   │
│   └── Functions:
│       ├── startup_event()         # Initialize all analyzers
│       ├── shutdown_event()        # Cleanup resources
│       ├── analyze_text()          # Text endpoint handler
│       ├── analyze_audio()         # Audio endpoint handler
│       ├── analyze_video()         # Video endpoint handler
│       ├── analyze_combined()      # Combined endpoint handler
│       └── Helper functions...
│
├── 📄 text_analyzer.py             # Text Sentiment Analysis Module
│   ├── Class: TextSentimentAnalyzer
│   │   ├── __init__()              # Initialize HF models
│   │   ├── analyze_sentiment_with_hf()   # HF API call
│   │   ├── generate_recommendations_with_hf()  # AI recommendations
│   │   ├── detect_risk_keywords()  # Keyword detection
│   │   ├── detect_emotions()       # Emotion detection
│   │   └── analyze_text()          # Main analysis method
│   │
│   ├── Models Used:
│   │   ├── tabularisai/multilingual-sentiment-analysis
│   │   └── meta-llama/Llama-3.1-8B-Instruct:novita
│   │
│   └── Pydantic Models:
│       ├── TextAnalysisRequest
│       ├── TextAnalysisResponse
│       └── MentalHealthResources
│
├── 📄 audio_analyzer.py            # Audio Emotion Analysis Module
│   ├── Class: AudioEmotionAnalyzer
│   │   ├── __init__()              # Initialize audio models
│   │   ├── analyze_emotion()       # Main emotion analysis
│   │   ├── _fallback_emotion_analysis()  # Fallback method
│   │   ├── calculate_risk_score()  # Risk calculation
│   │   ├── get_recommendations()   # Get recommendations
│   │   └── analyze_audio_file()    # Main analysis method
│   │
│   ├── Class: AudioProcessor
│   │   ├── convert_to_wav()        # Format conversion
│   │   ├── load_audio()            # Load audio data
│   │   └── validate_audio()        # Validation
│   │
│   └── Models Used:
│       └── firdhokk/speech-emotion-recognition-with-openai-whisper-large-v3
│
├── 📄 video_analyzer.py            # Video Emotion Detection Module
│   ├── Class: VideoEmotionDetector
│   │   ├── __init__()              # Initialize video models
│   │   ├── _detect_emotion_hf()    # HF emotion detection
│   │   ├── _approximate_emotion_from_landmarks()  # Fallback
│   │   ├── _detect_face_orientation()  # Face tracking
│   │   ├── process_video()         # Main video processing
│   │   ├── _generate_summary()     # Generate summary
│   │   └── cleanup()               # Resource cleanup
│   │
│   └── Models Used:
│       ├── dima806/facial_emotions_image_detection
│       └── MediaPipe Face Detection + Face Mesh
│
├── 📄 gemini_integrator.py         # Google Gemini AI Integration
│   ├── Class: GeminiIntegrator
│   │   ├── __init__()              # Initialize Gemini API
│   │   ├── generate_recommendations()  # Main generation
│   │   ├── _build_context()        # Context builder
│   │   ├── _parse_text_response()  # Response parser
│   │   ├── _get_fallback_response()  # Fallback
│   │   └── test_connection()       # Connection test
│   │
│   └── API Used:
│       └── Google Gemini Pro API
│
├── 📄 requirements.txt             # Python Dependencies
│   ├── FastAPI & Uvicorn           # Web framework
│   ├── Transformers & HuggingFace  # AI models
│   ├── Librosa & Soundfile         # Audio processing
│   ├── OpenCV & MediaPipe          # Video processing
│   ├── Google Generative AI        # Gemini API
│   └── Supporting libraries...
│
├── 📄 .env.example                 # Environment Variables Template
│   ├── HF_TOKEN                    # Hugging Face API token
│   ├── GEMINI_API_KEY              # Google Gemini API key
│   └── Configuration settings...
│
├── 📄 .env                         # Your Actual Environment Variables
│   └── (Create this from .env.example)
│
├── 📄 README.md                    # Main Documentation
│   ├── Features overview
│   ├── Installation guide
│   ├── Usage examples
│   ├── API endpoints
│   └── Troubleshooting
│
├── 📄 SETUP.md                     # Detailed Setup Guide
│   ├── Step-by-step installation
│   ├── System dependencies
│   ├── Common issues
│   └── Production deployment
│
├── 📄 test_api.py                  # Comprehensive Test Suite
│   ├── test_api_health()           # Health check test
│   ├── test_models_info()          # Models info test
│   ├── test_text_analysis()        # Text analysis tests
│   ├── test_audio_analysis()       # Audio analysis tests
│   ├── test_video_analysis()       # Video analysis tests
│   └── test_combined_analysis()    # Combined analysis tests
│
├── 📁 tests/ (optional)            # Additional Test Files
│   ├── test_text.py
│   ├── test_audio.py
│   └── test_video.py
│
└── 📁 venv/                        # Virtual Environment (created during setup)
    └── (Python packages installed here)
```

## Module Dependencies

```
main.py
 ├── text_analyzer.py
 │    └── Hugging Face API
 │         ├── tabularisai/multilingual-sentiment-analysis
 │         └── meta-llama/Llama-3.1-8B-Instruct:novita
 │
 ├── audio_analyzer.py
 │    └── Hugging Face API
 │         └── firdhokk/speech-emotion-recognition-with-openai-whisper-large-v3
 │
 ├── video_analyzer.py
 │    └── Hugging Face + MediaPipe
 │         ├── dima806/facial_emotions_image_detection
 │         └── MediaPipe Face Detection/Mesh
 │
 └── gemini_integrator.py
      └── Google Gemini API
           └── gemini-pro model
```

## Data Flow

```
1. TEXT ANALYSIS FLOW:
   User Input (text)
        ↓
   TextSentimentAnalyzer
        ↓
   HF Sentiment Model → Emotion Detection → Risk Calculation
        ↓
   HF LLM Model → Generate Recommendations
        ↓
   Return: Risk Level, Emotions, Recommendations

2. AUDIO ANALYSIS FLOW:
   User Input (audio file)
        ↓
   AudioProcessor (convert/validate)
        ↓
   AudioEmotionAnalyzer
        ↓
   HF Audio Model → Emotion Scores → Risk Calculation
        ↓
   Return: Primary Emotion, Risk Level, Recommendations

3. VIDEO ANALYSIS FLOW:
   User Input (video file)
        ↓
   VideoEmotionDetector
        ↓
   MediaPipe Face Detection → Extract Faces
        ↓
   HF Emotion Model → Emotion per Frame
        ↓
   Aggregate Results → Emotion Timeline
        ↓
   Return: Emotion Distribution, Stability, Summary

4. COMBINED ANALYSIS FLOW:
   User Input (text + audio + video)
        ↓
   Parallel Analysis:
        ├── Text Analysis (TextSentimentAnalyzer)
        ├── Audio Analysis (AudioEmotionAnalyzer)
        └── Video Analysis (VideoEmotionDetector)
        ↓
   Aggregate Results:
        ├── Calculate average risk score
        ├── Combine all detected emotions
        └── Determine overall risk level
        ↓
   GeminiIntegrator
        ├── Build comprehensive context
        ├── Generate personalized recommendations
        └── Create tailored advice
        ↓
   Return: Combined Analysis + AI Recommendations
```

## API Response Structure

```
COMBINED ANALYSIS RESPONSE:
{
  "overall_risk_level": "MEDIUM",
  "overall_risk_score": 42.5,
  "overall_confidence": 0.78,
  
  "text_analysis": {
    "risk_level": "MEDIUM",
    "risk_score": 45.0,
    "detected_emotions": ["anxiety", "stress"],
    "recommendations": [...]
  },
  
  "audio_analysis": {
    "risk_level": "MEDIUM",
    "primary_emotion": "sad",
    "emotion_scores": {...},
    "recommendations": [...]
  },
  
  "video_analysis": {
    "status": "success",
    "summary": {
      "most_frequent_emotion": "sadness",
      "emotion_distribution": {...},
      "emotional_stability": 0.65
    }
  },
  
  "combined_emotions": ["anxiety", "sadness", "stress", "fear"],
  
  "ai_recommendations": [
    "Personalized recommendation 1 from Gemini",
    "Personalized recommendation 2 from Gemini",
    "Personalized recommendation 3 from Gemini"
  ],
  
  "personalized_advice": "Detailed compassionate advice from Gemini AI...",
  
  "next_steps": [
    "Actionable step 1",
    "Actionable step 2",
    "Actionable step 3"
  ],
  
  "emergency_resources": {
    "Vandrevala Foundation": "9999666555",
    ...
  },
  
  "models_used": {
    "text": "tabularisai/multilingual-sentiment-analysis",
    "audio": "firdhokk/speech-emotion-recognition...",
    "video": "dima806/facial_emotions_image_detection"
  }
}
```

## Key Features by Module

### text_analyzer.py
- ✅ Multi-language sentiment analysis
- ✅ Risk keyword detection (CRITICAL, HIGH, MEDIUM, LOW)
- ✅ Emotion detection from text
- ✅ AI-powered recommendations using LLM
- ✅ Mental health resources database
- ✅ Confidence scoring

### audio_analyzer.py
- ✅ Multiple audio format support (wav, mp3, m4a, flac, ogg)
- ✅ Emotion recognition from speech
- ✅ Audio feature extraction (MFCC, spectral, etc.)
- ✅ Fallback analysis when API unavailable
- ✅ Risk calculation from audio emotions
- ✅ Duration validation

### video_analyzer.py
- ✅ Real-time facial emotion detection
- ✅ Frame-by-frame analysis with skip optimization
- ✅ Emotion timeline tracking
- ✅ Emotional stability calculation
- ✅ Multiple face support
- ✅ Face orientation detection
- ✅ Comprehensive summary statistics

### gemini_integrator.py
- ✅ Context-aware recommendation generation
- ✅ Personalized advice based on all inputs
- ✅ Risk-appropriate guidance
- ✅ Fallback responses when API unavailable
- ✅ JSON response parsing
- ✅ Compassionate communication style

### main.py
- ✅ Unified API interface
- ✅ CORS configuration
- ✅ Comprehensive error handling
- ✅ Health monitoring
- ✅ Interactive documentation (Swagger UI)
- ✅ Async support for concurrent requests
- ✅ File upload handling
- ✅ Session tracking
