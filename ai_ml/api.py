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
from text_extraction import extract_text_from_pdf, extract_syllabus_info

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
        
        # Process PDF directly with Gemini's document understanding
        try:
            from google import genai
            from google.genai import types
            import pathlib
            import json
            import re
            from loguru import logger
            
            client = genai.Client(api_key=api_key)
            
            # Read PDF file
            pdf_path = pathlib.Path(temp_path)
            pdf_data = pdf_path.read_bytes()
            
            # Create the prompt for Gemini
            prompt = """
            Extract ALL assignments, exams, projects, and important dates from this syllabus PDF.
            
            FOCUS ON THE "ASSIGNMENTS" COLUMN - look for phrases like "Due by", "Assigned", and specific due dates.
            
            CRITICAL INSTRUCTIONS:
            1. Find EVERY assignment, homework, quiz with due dates (look for: "Team:", "Individual:", "HW:", "Assignment", "Assigned", "Due by",)
            2. Find ALL exams (Midterm, Finals, Reviews, etc.) and their dates
            3. Find ALL projects, presentations, reports, and their due dates
            4. Extract team member evaluations, sprint plans, sprint reviews, and any other graded work
            5. Include the full title/description for each item
            6. Convert all dates to YYYY-MM-DD format (assume year 2025 if not specified)
            7. If a date range is given (e.g., "8/18-8/22"), use the END date as the due date
            8. Pay special attention to items with time stamps like "11:59PM" - these are important deadlines
            
            Return ONLY valid JSON in this exact format (no markdown, no extra text):
            {
                "course_name": "Full Course Name",
                "course_code": "Course Code",
                "professor": {
                    "name": "Professor Name",
                    "email": "email@domain.com",
                    "office_hours": "Office hours description"
                },
                "class_schedule": "Class meeting schedule",
                "homework": [
                    {
                        "title": "Assignment Title",
                        "due_date": "YYYY-MM-DD",
                        "description": "Assignment description"
                    }
                ],
                "exams": [
                    {
                        "type": "Midterm/Final/Quiz",
                        "date": "YYYY-MM-DD",
                        "description": "Exam details"
                    }
                ],
                "projects": [
                    {
                        "title": "Project Title",
                        "due_date": "YYYY-MM-DD",
                        "description": "Project description"
                    }
                ]
            }
            """
            
            # Process PDF with Gemini's document understanding
            logger.info(f"Processing PDF with Gemini document understanding: {file.filename}")
            response = client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=[
                    types.Part.from_bytes(
                        data=pdf_data,
                        mime_type='application/pdf',
                    ),
                    prompt
                ]
            )
            
            logger.info(f"Gemini response received (first 500 chars): {response.text[:500]}")
            
            # Parse the response
            response_text = response.text.strip()
            if response_text.startswith('```'):
                # Remove markdown code blocks if present
                response_text = re.sub(r'^```(?:json)?\s*', '', response_text)
                response_text = re.sub(r'\s*```$', '', response_text)
            
            analysis_result = json.loads(response_text)
            logger.info("Successfully parsed Gemini response")
            
            # Add metadata
            analysis_result['metadata'] = {
                'filename': file.filename,
                'extraction_method': 'gemini-document-understanding'
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
            extracted_text = extract_text_from_pdf(temp_path)
            
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
