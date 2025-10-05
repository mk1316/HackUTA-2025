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
import re
from typing import Dict
from dotenv import load_dotenv
from loguru import logger

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
    Extract and analyze syllabus from uploaded PDF file using Gemini's native document understanding
    
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
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            # Write uploaded file to temp file
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # Use Gemini's native document understanding
        try:
            from google import genai
            from google.genai import types
            import pathlib
            
            client = genai.Client(api_key=api_key)
            
            # Read PDF bytes
            pdf_path = pathlib.Path(temp_path)
            pdf_data = pdf_path.read_bytes()
            
            # Prompt for Gemini
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
            
            # Clean up markdown code blocks if present
            response_text = response.text.strip()
            if response_text.startswith('```'):
                response_text = re.sub(r'^```(?:json)?\s*', '', response_text)
                response_text = re.sub(r'\s*```$', '', response_text)
            
            # Parse JSON response
            analysis_result = json.loads(response_text)
            logger.info("Successfully parsed Gemini response")
            
            # Add metadata
            analysis_result['metadata'] = {
                'filename': file.filename,
                'extraction_method': 'gemini-document-understanding'
            }
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error processing syllabus: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Error processing syllabus: {str(e)}"
            )
        
    finally:
        # Clean up temporary file
        if temp_path and os.path.exists(temp_path):
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

@app.post("/voice-summary")
async def generate_voice_summary(file: UploadFile = File(...)) -> Dict:
    """
    Generate a humorous voice summary of the syllabus using ElevenLabs
    
    Args:
        file: PDF file upload
        
    Returns:
        Audio file path and summary text
    """
    # Check for required API keys
    gemini_key = os.getenv('GEMINI_API_KEY')
    elevenlabs_key = os.getenv('ELEVENLABS_API_KEY')
    
    if not gemini_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
    if not elevenlabs_key:
        raise HTTPException(status_code=500, detail="ELEVENLABS_API_KEY not configured")
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        try:
            from google import genai
            from google.genai import types
            import pathlib
            from working_voice_summary import generate_humorous_summary, generate_mp3_with_elevenlabs
            
            # First, extract syllabus data using Gemini's document understanding
            client = genai.Client(api_key=gemini_key)
            pdf_path = pathlib.Path(temp_path)
            pdf_data = pdf_path.read_bytes()
            
            extraction_prompt = """
            Extract ALL course information from this syllabus PDF.
            
            Return ONLY valid JSON in this exact format (no markdown, no extra text):
            {
                "course_name": "Full Course Name",
                "course_code": "Course Code",
                "professor": {
                    "name": "Professor Name",
                    "email": "email@domain.com",
                    "office_hours": "Office hours description"
                },
                "class_schedule": "Class meeting schedule (days and times)",
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
            
            logger.info(f"Extracting syllabus data for voice summary: {file.filename}")
            response = client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=[
                    types.Part.from_bytes(data=pdf_data, mime_type='application/pdf'),
                    extraction_prompt
                ]
            )
            
            # Parse the extracted data
            response_text = response.text.strip()
            if response_text.startswith('```'):
                response_text = re.sub(r'^```(?:json)?\s*', '', response_text)
                response_text = re.sub(r'\s*```$', '', response_text)
            
            syllabus_data = json.loads(response_text)
            logger.info("Successfully extracted syllabus data for voice summary")
            
            # Convert to course format for voice summary
            course = {
                "course_name": syllabus_data.get('course_name', 'Unknown Course'),
                "course_code": syllabus_data.get('course_code', ''),
                "professor": syllabus_data.get('professor', {}),
                "class_schedule": syllabus_data.get('class_schedule', ''),
                "homework": syllabus_data.get('homework', []),
                "exams": syllabus_data.get('exams', []),
                "projects": syllabus_data.get('projects', [])
            }
            
            # Generate humorous summary
            logger.info("Generating humorous summary...")
            summary_text = generate_humorous_summary([course])
            
            # Generate audio
            logger.info("Generating audio with ElevenLabs...")
            audio_path = generate_mp3_with_elevenlabs(summary_text)
            
            if audio_path and os.path.exists(audio_path):
                with open(audio_path, 'rb') as audio_file:
                    audio_data = audio_file.read()
                
                import base64
                audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                
                # Clean up audio file
                os.unlink(audio_path)
                
                return {
                    'success': True,
                    'summary_text': summary_text,
                    'audio_base64': audio_base64,
                    'audio_filename': 'syllabus_summary.mp3'
                }
            else:
                raise HTTPException(status_code=500, detail="Failed to generate audio")
                
        except Exception as e:
            logger.error(f"Error generating voice summary: {e}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Error generating voice summary: {str(e)}")
    
    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=5050,
        reload=True
    )
