import pytest
import asyncio
import numpy as np
import io
import soundfile as sf
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "Audio Emotion Detection API" in data["message"]

def test_health_endpoint():
    """Test health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "audio_model_status" in data

def test_models_endpoint():
    """Test models endpoint"""
    response = client.get("/models")
    assert response.status_code == 200
    data = response.json()
    assert "audio_emotion_model" in data

def test_resources_endpoint():
    """Test resources endpoint"""
    response = client.get("/resources")
    assert response.status_code == 200
    data = response.json()
    assert "resources" in data

def generate_test_audio():
    """Generate test audio file"""
    # Create a simple sine wave
    sample_rate = 16000
    duration = 3
    t = np.linspace(0, duration, int(sample_rate * duration))
    audio = 0.5 * np.sin(2 * np.pi * 440 * t)
    
    # Convert to bytes
    buffer = io.BytesIO()
    sf.write(buffer, audio, sample_rate, format='WAV')
    return buffer.getvalue()

def test_audio_analysis():
    """Test audio analysis endpoint"""
    # Generate test audio
    audio_bytes = generate_test_audio()
    
    # Prepare multipart form data
    files = {
        "file": ("test.wav", audio_bytes, "audio/wav")
    }
    
    data = {
        "user_id": "test_user",
        "session_id": "test_session",
        "language": "english"
    }
    
    response = client.post("/analyze", files=files, data=data)
    
    # Check response
    if response.status_code != 200:
        print(f"Error: {response.json()}")
    
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert "risk_level" in data
    assert "primary_emotion" in data

def test_batch_analysis():
    """Test batch analysis endpoint"""
    audio_bytes = generate_test_audio()
    
    files = [
        ("files", ("test1.wav", audio_bytes, "audio/wav")),
        ("files", ("test2.wav", audio_bytes, "audio/wav"))
    ]
    
    response = client.post("/analyze-batch", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert "batch_id" in data
    assert "total_files" in data

if __name__ == "__main__":
    # Run tests
    test_root_endpoint()
    print("✓ Root endpoint test passed")
    
    test_health_endpoint()
    print("✓ Health endpoint test passed")
    
    test_models_endpoint()
    print("✓ Models endpoint test passed")
    
    test_resources_endpoint()
    print("✓ Resources endpoint test passed")
    
    test_audio_analysis()
    print("✓ Audio analysis test passed")
    
    test_batch_analysis()
    print("✓ Batch analysis test passed")
    
    print("\n✅ All tests passed!")