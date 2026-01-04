import librosa
import numpy as np
import soundfile as sf
from pydub import AudioSegment
import io
import tempfile
import os
from typing import Tuple, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class AudioProcessor:
    """Audio processing utilities"""
    
    @staticmethod
    def convert_to_wav(audio_bytes: bytes, input_format: str) -> bytes:
        """Convert any audio format to WAV"""
        try:
            # Create AudioSegment from bytes
            audio = AudioSegment.from_file(io.BytesIO(audio_bytes), format=input_format)
            
            # Export to WAV format
            wav_buffer = io.BytesIO()
            audio.export(wav_buffer, format="wav")
            
            return wav_buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Audio conversion failed: {str(e)}")
            raise ValueError(f"Failed to convert audio: {str(e)}")
    
    @staticmethod
    def load_and_preprocess(audio_bytes: bytes, target_sr: int = 16000) -> Tuple[np.ndarray, int]:
        """Load and preprocess audio bytes"""
        try:
            # Write bytes to temporary file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
                tmp_file.write(audio_bytes)
                tmp_path = tmp_file.name
            
            # Load audio with librosa
            audio, sr = librosa.load(tmp_path, sr=target_sr, duration=30)
            
            # Clean up temp file
            os.unlink(tmp_path)
            
            return audio, sr
            
        except Exception as e:
            logger.error(f"Audio loading failed: {str(e)}")
            raise ValueError(f"Failed to load audio: {str(e)}")
    
    @staticmethod
    def extract_features(audio: np.ndarray, sr: int) -> Dict[str, Any]:
        """Extract audio features for analysis"""
        features = {}
        
        # MFCC features
        mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
        features['mfcc_mean'] = np.mean(mfccs, axis=1).tolist()
        features['mfcc_std'] = np.std(mfccs, axis=1).tolist()
        
        # Spectral features
        spectral_centroid = librosa.feature.spectral_centroid(y=audio, sr=sr)
        features['spectral_centroid_mean'] = float(np.mean(spectral_centroid))
        
        # Zero crossing rate
        zcr = librosa.feature.zero_crossing_rate(y=audio)
        features['zero_crossing_rate_mean'] = float(np.mean(zcr))
        
        # RMS energy
        rms = librosa.feature.rms(y=audio)
        features['rms_mean'] = float(np.mean(rms))
        
        return features
    
    @staticmethod
    def validate_audio_duration(audio_bytes: bytes, max_duration: int = 30) -> bool:
        """Validate audio duration"""
        try:
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
                tmp_file.write(audio_bytes)
                tmp_path = tmp_file.name
            
            # Get duration using librosa
            duration = librosa.get_duration(path=tmp_path)
            
            # Clean up
            os.unlink(tmp_path)
            
            return duration <= max_duration
            
        except Exception as e:
            logger.error(f"Duration validation failed: {str(e)}")
            return False
    
    @staticmethod
    def get_audio_info(audio_bytes: bytes) -> Dict[str, Any]:
        """Get audio file information"""
        try:
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
                tmp_file.write(audio_bytes)
                tmp_path = tmp_file.name
            
            info = sf.info(tmp_path)
            
            audio_info = {
                'duration': info.duration,
                'sample_rate': info.samplerate,
                'channels': info.channels,
                'format': info.format,
                'subtype': info.subtype
            }
            
            # Clean up
            os.unlink(tmp_path)
            
            return audio_info
            
        except Exception as e:
            logger.error(f"Audio info extraction failed: {str(e)}")
            return {}