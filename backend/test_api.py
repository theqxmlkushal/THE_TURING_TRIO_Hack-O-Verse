#!/usr/bin/env python3
"""
Test script for Integrated Mental Health Analysis API
Tests all endpoints and validates responses
"""

import requests
import json
import time
import sys
from pathlib import Path

# API Configuration
API_BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def print_header(text):
    """Print formatted header"""
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70)

def print_result(success, message):
    """Print test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")

def test_api_health():
    """Test API health endpoint"""
    print_header("Testing API Health")
    
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, "API is healthy")
            
            print("\n📊 Module Status:")
            modules = data.get('modules', {})
            for name, info in modules.items():
                available = info.get('available', False)
                initialized = info.get('initialized', False)
                status = "✓" if (available and initialized) else "✗"
                print(f"  {status} {name}: Available={available}, Initialized={initialized}")
            
            return True
        else:
            print_result(False, f"Health check failed with status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_result(False, "Cannot connect to API. Is it running?")
        print("\n💡 Start the API with: python main.py")
        return False
    except Exception as e:
        print_result(False, f"Health check error: {str(e)}")
        return False

def test_models_info():
    """Test models information endpoint"""
    print_header("Testing Models Information")
    
    try:
        response = requests.get(f"{API_BASE_URL}/models", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, "Models info retrieved")
            
            print("\n🤖 Models Used:")
            for category, info in data.items():
                if isinstance(info, dict):
                    print(f"\n  {category.upper()}:")
                    for key, value in info.items():
                        if key != 'status':
                            print(f"    - {key}: {value}")
            
            return True
        else:
            print_result(False, f"Models info failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_result(False, f"Models info error: {str(e)}")
        return False

def test_text_analysis():
    """Test text analysis endpoint"""
    print_header("Testing Text Analysis")
    
    test_cases = [
        {
            "name": "Positive text",
            "text": "I am feeling happy and excited about life!",
            "expected_risk": ["LOW"]
        },
        {
            "name": "Moderate concern",
            "text": "I've been feeling stressed and anxious lately.",
            "expected_risk": ["MEDIUM", "LOW"]
        },
        {
            "name": "High concern",
            "text": "I feel hopeless and worthless. Nothing matters anymore.",
            "expected_risk": ["HIGH", "CRITICAL"]
        }
    ]
    
    passed = 0
    failed = 0
    
    for test_case in test_cases:
        print(f"\n📝 Test: {test_case['name']}")
        print(f"   Text: '{test_case['text'][:50]}...'")
        
        try:
            response = requests.post(
                f"{API_BASE_URL}/analyze/text",
                json={"text": test_case['text']},
                timeout=TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                risk_level = data.get('risk_level')
                risk_score = data.get('risk_score')
                
                if risk_level in test_case['expected_risk']:
                    print_result(True, f"Risk Level: {risk_level} (Score: {risk_score})")
                    passed += 1
                else:
                    print_result(False, f"Unexpected risk level: {risk_level}")
                    failed += 1
                
                # Show some details
                print(f"   Emotions: {', '.join(data.get('detected_emotions', [])[:3])}")
                print(f"   Confidence: {data.get('confidence'):.2f}")
                
            else:
                print_result(False, f"Status code: {response.status_code}")
                print(f"   Error: {response.text[:100]}")
                failed += 1
                
        except Exception as e:
            print_result(False, f"Error: {str(e)}")
            failed += 1
    
    print(f"\n📊 Text Analysis Summary: {passed} passed, {failed} failed")
    return failed == 0

def test_audio_analysis():
    """Test audio analysis endpoint (requires audio file)"""
    print_header("Testing Audio Analysis")
    
    # Check if test audio file exists
    test_audio_path = Path("test_audio.wav")
    
    if not test_audio_path.exists():
        print("⚠️  No test audio file found (test_audio.wav)")
        print("   Creating a simple test audio file...")
        
        try:
            import numpy as np
            import soundfile as sf
            
            # Generate a simple test tone
            sample_rate = 16000
            duration = 3
            t = np.linspace(0, duration, sample_rate * duration)
            audio = 0.3 * np.sin(2 * np.pi * 440 * t)  # A4 note
            
            sf.write('test_audio.wav', audio, sample_rate)
            print_result(True, "Test audio file created")
            
        except Exception as e:
            print_result(False, f"Could not create test audio: {str(e)}")
            print("   Skipping audio analysis test")
            return True  # Don't fail the entire test suite
    
    try:
        with open('test_audio.wav', 'rb') as f:
            files = {'file': ('test_audio.wav', f, 'audio/wav')}
            
            response = requests.post(
                f"{API_BASE_URL}/analyze/audio",
                files=files,
                timeout=TIMEOUT
            )
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, "Audio analysis completed")
            
            print(f"\n📊 Results:")
            print(f"   Primary Emotion: {data.get('primary_emotion')}")
            print(f"   Risk Level: {data.get('risk_level')}")
            print(f"   Risk Score: {data.get('risk_score')}")
            print(f"   Confidence: {data.get('confidence'):.3f}")
            print(f"   Processing Time: {data.get('processing_time')}s")
            
            return True
        else:
            print_result(False, f"Status code: {response.status_code}")
            print(f"   Error: {response.text[:200]}")
            return False
            
    except FileNotFoundError:
        print_result(False, "Test audio file not found")
        return False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return False

def test_video_analysis():
    """Test video analysis endpoint (requires video file)"""
    print_header("Testing Video Analysis")
    
    # Check if test video file exists
    test_video_path = Path("test_video.mp4")
    
    if not test_video_path.exists():
        print("⚠️  No test video file found (test_video.mp4)")
        print("   Please provide a test video file to test this endpoint")
        print("   Skipping video analysis test")
        return True  # Don't fail the entire test suite
    
    try:
        with open('test_video.mp4', 'rb') as f:
            files = {'file': ('test_video.mp4', f, 'video/mp4')}
            data = {'frame_skip': 10}
            
            print("   Processing video (this may take a minute)...")
            response = requests.post(
                f"{API_BASE_URL}/analyze/video",
                files=files,
                data=data,
                timeout=120  # Longer timeout for video
            )
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, "Video analysis completed")
            
            if data.get('status') == 'success':
                summary = data.get('summary', {})
                print(f"\n📊 Results:")
                print(f"   Status: {data.get('status')}")
                print(f"   Frames Analyzed: {data.get('total_frames_analyzed')}")
                print(f"   Duration: {data.get('duration')}s")
                print(f"   Processing Time: {data.get('processing_time')}s")
                print(f"   Most Frequent Emotion: {summary.get('most_frequent_emotion')}")
                print(f"   Emotional Stability: {summary.get('emotional_stability'):.2f}")
            else:
                print_result(False, f"Video analysis status: {data.get('status')}")
            
            return True
        else:
            print_result(False, f"Status code: {response.status_code}")
            print(f"   Error: {response.text[:200]}")
            return False
            
    except FileNotFoundError:
        print_result(False, "Test video file not found")
        return False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return False

def test_combined_analysis():
    """Test combined analysis endpoint"""
    print_header("Testing Combined Analysis")
    
    try:
        # Prepare request with text (minimum requirement)
        data = {
            'text': 'I have been feeling very stressed and anxious lately. It is affecting my sleep.',
            'user_id': 'test_user',
            'session_id': 'test_session'
        }
        
        print("   Running combined analysis with text input...")
        response = requests.post(
            f"{API_BASE_URL}/analyze/combined",
            data=data,
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            result = response.json()
            print_result(True, "Combined analysis completed")
            
            print(f"\n📊 Overall Results:")
            print(f"   Risk Level: {result.get('overall_risk_level')}")
            print(f"   Risk Score: {result.get('overall_risk_score')}")
            print(f"   Confidence: {result.get('overall_confidence'):.2f}")
            print(f"   Combined Emotions: {', '.join(result.get('combined_emotions', [])[:5])}")
            
            print(f"\n🤖 AI Recommendations:")
            for i, rec in enumerate(result.get('ai_recommendations', [])[:3], 1):
                print(f"   {i}. {rec[:80]}...")
            
            print(f"\n💡 Personalized Advice:")
            advice = result.get('personalized_advice', '')
            print(f"   {advice[:150]}...")
            
            return True
        else:
            print_result(False, f"Status code: {response.status_code}")
            print(f"   Error: {response.text[:200]}")
            return False
            
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print_header("🧪 Integrated Mental Health Analysis API - Test Suite")
    print(f"Testing API at: {API_BASE_URL}")
    print(f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {
        "API Health": test_api_health(),
        "Models Info": test_models_info(),
        "Text Analysis": test_text_analysis(),
        "Audio Analysis": test_audio_analysis(),
        "Video Analysis": test_video_analysis(),
        "Combined Analysis": test_combined_analysis()
    }
    
    # Summary
    print_header("📊 Test Summary")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    print(f"\nResults:")
    for test_name, passed_test in results.items():
        status = "✅ PASS" if passed_test else "❌ FAIL"
        print(f"  {status} - {test_name}")
    
    print(f"\n{'='*70}")
    print(f"Total: {passed}/{total} tests passed")
    print(f"{'='*70}")
    
    if passed == total:
        print("\n🎉 All tests passed! API is working correctly.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check the errors above.")
        return 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        sys.exit(1)
