# 🧠 Mental Health Sentiment Analysis API

An **AI-powered FastAPI backend** for mental-health–focused text analysis.  
It performs **risk assessment, sentiment analysis, emotion detection**, and **generates personalized mental health recommendations** using Hugging Face models.

> ⚠️ **Important Disclaimer:** This system is a **support tool**, not a medical professional. Always combine with human oversight for real-world use.

---

## ✨ Features

- **AI-powered sentiment analysis**
- **Mental health–aware risk classification** (LOW → CRITICAL)
- **Emotion and keyword detection**
- **Personalized AI-generated recommendations**
- **Crisis-aware warning flags**
- **Built-in mental health resources** (India-focused)
- **FastAPI + Pydantic response validation**
- **Hugging Face Inference API integration**
- **Graceful fallback when AI is unavailable**

---

## 🏗️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | FastAPI |
| **Language** | Python 3.9+ |
| **Sentiment Model** | `tabularisai/multilingual-sentiment-analysis` |
| **Text Generation** | `meta-llama/Llama-3.1-8B-Instruct` |
| **Inference** | Hugging Face Inference Providers |
| **Server** | Uvicorn |
| **Environment** | .env, dotenv |

---

## 📁 Project Structure

```text
mental-health-sentiment-api/
├── main.py              # FastAPI application
├── .env                 # Environment variables
├── requirements.txt     # Python dependencies
├── README.md           # This documentation
└── .gitignore          # Git ignore file
```

---

## 🔑 Prerequisites

- **Python 3.9** or higher
- **Hugging Face account** with API access
- **Hugging Face API token** with inference permissions
- **Internet connection** for model inference

---

## 📦 Installation

### 1️⃣ Clone the repository
```bash
git clone <your-repo-url>
cd mental-health-sentiment-api
```

### 2️⃣ Create and activate a virtual environment
```bash
# Linux / macOS
python -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 3️⃣ Install dependencies
```bash
pip install -r requirements.txt
```

---

## 🔐 Environment Setup

Create a `.env` file in the project root:

```env
HF_TOKEN=your_huggingface_api_token_here
```

**Generate your Hugging Face token at:**  
👉 [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

---

## 🚀 Running the API

### Start the server (production)
```bash
python main.py
```

### Development mode (auto-reload)
```bash
python main.py --reload
```

### API will be available at:
```
http://localhost:8000
```

---

## 📖 API Documentation

FastAPI automatically generates interactive documentation:

| Documentation | URL |
|--------------|-----|
| **Swagger UI** | http://localhost:8000/docs |
| **ReDoc** | http://localhost:8000/redoc |

---

## 🔍 Health & Status Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### Models Information
```http
GET /models
```

**Response:**
```json
{
  "sentiment_model": "tabularisai/multilingual-sentiment-analysis",
  "chat_model": "meta-llama/Llama-3.1-8B-Instruct",
  "status": "available"
}
```

### Mental Health Resources
```http
GET /resources
```

**Response:** Returns a list of mental health resources including helplines, websites, and support services.

---

## 🧠 Text Analysis Endpoint

### Endpoint
```http
POST /analyze
```

### Request Body
```json
{
  "text": "I feel anxious about my future and exams",
  "user_id": "user_123",
  "session_id": "session_456",
  "language": "english"
}
```

### Response Example
```json
{
  "risk_level": "MEDIUM",
  "risk_score": 56.2,
  "confidence": 0.85,
  "detected_emotions": ["anxiety", "stress"],
  "recommendations": [
    "Practice deep breathing exercises daily to reduce anxiety.",
    "Consider speaking with a counselor about exam-related stress.",
    "Maintain a consistent sleep routine to support emotional stability."
  ],
  "next_step": "Recommended: Consider professional consultation.",
  "warning_flags": ["anxiety_mention"],
  "resources": [
    {
      "type": "helpline",
      "name": "Vandrevala Foundation",
      "contact": "+91-9999666555"
    }
  ]
}
```

### Risk Levels
| Level | Description | Recommended Action |
|-------|-------------|-------------------|
| **LOW** | Minimal risk indicators | Self-care strategies |
| **MEDIUM** | Moderate distress signs | Professional consultation recommended |
| **HIGH** | Significant risk indicators | Immediate professional support advised |
| **CRITICAL** | Severe crisis indicators | Emergency intervention required |

---

## 🧪 Testing

### Run built-in tests
```bash
python main.py --test
```

**This verifies:**
- ✅ Hugging Face API access
- ✅ Sentiment model availability
- ✅ Chat model availability
- ✅ End-to-end analysis pipeline

### Test with cURL
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I have been feeling very sad lately",
    "user_id": "test_user",
    "language": "english"
  }'
```

---

## 🚨 Safety & Disclaimer

### ⚠️ **Important Warnings**
- **This system does NOT provide medical diagnosis**
- **Always escalate HIGH / CRITICAL cases to professionals**
- **Emergency helplines are included in responses for crisis situations**
- **Intended for support and guidance only**

### 🆘 Emergency Resources (India)
- **Vandrevala Foundation**: 1860-2662-345 / +91-9999-666-555
- **iCall**: +91-9152987821
- **AASRA**: +91-9820466726
- **National Suicide Prevention Helpline**: 044-24640050

---

## 📌 Notes & Limitations

- **Maximum input length**: 5000 characters
- **AI Fallback**: If Hugging Face inference is unavailable, system falls back to keyword-based analysis
- **Language Support**: Primarily optimized for English, with multilingual capabilities
- **Response Time**: Typically 2-5 seconds depending on model load
- **Rate Limiting**: Consider implementing if deploying publicly

---

## 🔧 Extending the System

### Adding New Models
1. Update the `MODEL_CONFIGS` dictionary in `main.py`
2. Add new model handlers
3. Update fallback logic if needed

### Customizing Resources
- Modify the `MENTAL_HEALTH_RESOURCES` dictionary
- Add region-specific helplines
- Include local counseling centers

### Enhancing Analysis
- Add more emotion detection models
- Implement pattern recognition for specific disorders
- Include context-aware response generation

---

## 🛡️ Privacy & Security

- **No data persistence**: Analysis is performed in real-time, no storage of user inputs
- **Anonymous processing**: User IDs are optional and used only for session tracking
- **Secure API**: Consider adding authentication for production deployment
- **Compliance**: Ensure compliance with local data protection regulations

---

## 📄 License

This project is released for **educational and research purposes**.
Use **responsibly and ethically**.

**Note**: Always prioritize user safety and consult with mental health professionals when implementing such systems in production environments.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
5. Ensure all tests pass

---

## 📞 Support

For technical issues:
- Open an issue in the repository
- Check the API documentation first
- Ensure your Hugging Face token has proper permissions

For mental health support:
- Contact professional helplines
- Reach out to licensed therapists
- In emergencies, contact local emergency services

---

**Remember**: Technology supports, but human connection heals. Always combine AI tools with professional human care.