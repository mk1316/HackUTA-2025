#!/usr/bin/env python3
"""
AI/ML FastAPI Service
Provides REST API endpoints for syllabus processing
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import tempfile
import json
from typing import Dict
from dotenv import load_dotenv

# Import our extraction functions
from main import extract_text, extract_optimized_syllabus_info

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="SyllabusSync AI/ML Service",
    description="AI-powered syllabus text extraction and analysis",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "SyllabusSync AI/ML Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    api_key = os.getenv('GEMINI_API_KEY')
    return {
        "status": "healthy",
        "gemini_configured": bool(api_key)
    }

@app.post("/extract")
async def extract_syllabus(file: UploadFile = File(...)) -> Dict:
    """
    Extract and analyze syllabus from uploaded PDF file
    
    Args:
        file: PDF file upload
        
    Returns:
        JSON with structured syllabus information
    """
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )
    
    # Check for API key
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY not configured"
        )
    
    # Create temporary file to save upload
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            # Write uploaded file to temp file
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # Extract text from PDF
        try:
            extracted_text = extract_text(temp_path)
            
            if not extracted_text or len(extracted_text.strip()) < 50:
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract sufficient text from PDF. The file may be empty or corrupted."
                )
            
            # Analyze with Gemini
            analysis_result = extract_optimized_syllabus_info(extracted_text, api_key)
            
            # Add metadata
            analysis_result['metadata'] = {
                'filename': file.filename,
                'text_length': len(extracted_text),
                'extraction_method': 'pdfplumber + gemini'
            }
            
            return analysis_result
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing syllabus: {str(e)}"
            )
        
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.unlink(temp_path)

@app.post("/extract-text-only")
async def extract_text_only(file: UploadFile = File(...)) -> Dict:
    """
    Extract only raw text from PDF without AI analysis
    
    Args:
        file: PDF file upload
        
    Returns:
        JSON with extracted text
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        try:
            extracted_text = extract_text(temp_path)
            
            return {
                'filename': file.filename,
                'text': extracted_text,
                'length': len(extracted_text)
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error extracting text: {str(e)}"
            )
        
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=5050,
        reload=True
    )
