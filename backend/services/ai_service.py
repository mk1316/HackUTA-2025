import requests
import os
from fastapi import HTTPException
from loguru import logger

AI_ML_URL = os.getenv("AI_ML_URL", "http://localhost:5050")

async def get_parsed_syllabus(file_bytes: bytes, filename: str) -> dict:
    """
    Send file to AI/ML microservice for parsing
    
    Args:
        file_bytes: Raw file bytes
        filename: Original filename
        
    Returns:
        Parsed syllabus data as dictionary
        
    Raises:
        HTTPException: If AI service fails
    """
    try:
        # Prepare files for multipart upload
        files = {
            'file': (filename, file_bytes, 'application/pdf')
        }
        
        # Send request to AI/ML microservice
        # Increased timeout to 120 seconds for Gemini API processing
        response = requests.post(
            f"{AI_ML_URL}/extract",
            files=files,
            timeout=120
        )
        
        if response.status_code != 200:
            logger.error(f"AI service returned status {response.status_code}: {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"AI service error: {response.text}"
            )
        
        # Parse JSON response
        parsed_data = response.json()
        logger.info(f"Successfully parsed syllabus: {filename}")
        
        return parsed_data
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to connect to AI service: {e}")
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable"
        )
    except Exception as e:
        logger.error(f"Unexpected error in AI service: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to parse syllabus"
        )
