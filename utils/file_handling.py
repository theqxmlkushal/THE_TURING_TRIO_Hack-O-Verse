import os
import uuid
import shutil
from typing import Optional, Tuple
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class FileHandler:
    """File handling utilities for audio files"""
    
    def __init__(self, upload_dir: str = "uploads", temp_dir: str = "temp"):
        self.upload_dir = upload_dir
        self.temp_dir = temp_dir
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Create necessary directories if they don't exist"""
        os.makedirs(self.upload_dir, exist_ok=True)
        os.makedirs(self.temp_dir, exist_ok=True)
    
    def save_uploaded_file(self, file_bytes: bytes, file_extension: str) -> Tuple[str, str]:
        """Save uploaded file and return path and unique ID"""
        # Generate unique filename
        unique_id = str(uuid.uuid4())
        filename = f"{unique_id}.{file_extension}"
        filepath = os.path.join(self.upload_dir, filename)
        
        # Save file
        with open(filepath, 'wb') as f:
            f.write(file_bytes)
        
        logger.info(f"Saved uploaded file: {filename}")
        return filepath, unique_id
    
    def save_temp_file(self, file_bytes: bytes, suffix: str = ".wav") -> str:
        """Save file to temp directory"""
        unique_id = str(uuid.uuid4())
        filename = f"{unique_id}{suffix}"
        filepath = os.path.join(self.temp_dir, filename)
        
        with open(filepath, 'wb') as f:
            f.write(file_bytes)
        
        return filepath
    
    def cleanup_file(self, filepath: str):
        """Remove file from filesystem"""
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                logger.info(f"Cleaned up file: {filepath}")
        except Exception as e:
            logger.error(f"Failed to cleanup file {filepath}: {str(e)}")
    
    def cleanup_old_files(self, directory: str, max_age_hours: int = 24):
        """Clean up files older than specified hours"""
        try:
            current_time = datetime.now().timestamp()
            
            for filename in os.listdir(directory):
                filepath = os.path.join(directory, filename)
                
                if os.path.isfile(filepath):
                    file_age = current_time - os.path.getmtime(filepath)
                    
                    if file_age > (max_age_hours * 3600):
                        os.remove(filepath)
                        logger.info(f"Cleaned up old file: {filename}")
                        
        except Exception as e:
            logger.error(f"Failed to cleanup old files: {str(e)}")
    
    def get_file_size(self, filepath: str) -> int:
        """Get file size in bytes"""
        return os.path.getsize(filepath) if os.path.exists(filepath) else 0