import requests
import sys

def test_audio(file_path):
    """Test your audio file"""
    print(f"🎤 Testing: {file_path}")
    
    with open(file_path, "rb") as f:
        files = {"file": (file_path, f, "audio/wav")}
        data = {"user_id": "test", "session_id": "123"}
        
        response = requests.post(
            "http://localhost:8001/analyze",
            files=files,
            data=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ RESULTS:")
            print(f"  Emotion: {result['primary_emotion']}")
            print(f"  Risk Level: {result['risk_level']}")
            print(f"  Risk Score: {result['risk_score']}")
            print(f"  Confidence: {result['confidence']}")
            print(f"\n💡 Recommendations:")
            for i, rec in enumerate(result['recommendations'][:3], 1):
                print(f"  {i}. {rec}")
            
            # Save full results
            import json
            with open("result.json", "w") as out:
                json.dump(result, out, indent=2)
            print(f"\n💾 Full results saved to: result.json")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_audio(sys.argv[1])
    else:
        print("Usage: python test_my_audio.py path/to/audio.wav")