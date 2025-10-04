#!/usr/bin/env python3
"""
FastAPI Main Application
Integrated syllabus parser with AI optimization and study scheduling
"""

import os
import logging
import tempfile
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import our modules
from text_extraction import extract_text_from_pdf, extract_syllabus_info, validate_pdf
from study_estimator import estimate_study_schedule, format_schedule_for_frontend
from gemini_teacher import optimize_course_structure, generate_study_recommendations

# Initialize FastAPI app
app = FastAPI(
    title="Syllabus Parser API",
    description="AI-powered syllabus parsing with intelligent study scheduling",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class ParseResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
    extraction_stats: Optional[dict] = None

class EstimateResponse(BaseModel):
    success: bool
    message: str
    schedule: Optional[dict] = None
    total_courses: int = 0
    total_weekly_hours: int = 0

class CourseData(BaseModel):
    course_name: str
    professor: dict
    class_schedule: str
    chapters: List[dict]
    homework: List[dict]
    exams: List[dict]
    projects: List[dict]
    academic_dates: List[str]

# Health check endpoint
@app.get("/")
def read_root():
    """Health check endpoint."""
    return {"message": "Syllabus Parser API is online", "status": "healthy"}

# Parse endpoint - extracts JSON from one or multiple PDFs
@app.post("/parse", response_model=ParseResponse)
async def parse_syllabus(
    files: List[UploadFile] = File(...),
    optimize: bool = Query(False, description="Enable AI optimization for chapter reordering")
):
    """
    Parse one or multiple syllabus PDFs and extract structured data.
    
    Args:
        files: List of PDF files to process
        optimize: Whether to use AI optimization for chapter reordering
        
    Returns:
        ParseResponse: Structured course data
    """
    logger.info(f"Received {len(files)} PDF files for parsing")
    
    try:
        # Check API key for optimization
        api_key = os.getenv('GEMINI_API_KEY')
        if optimize and not api_key:
            raise HTTPException(
                status_code=400, 
                detail="GEMINI_API_KEY environment variable required for optimization"
            )
        
        parsed_courses = []
        total_extraction_stats = {
            "total_files": len(files),
            "successful_extractions": 0,
            "total_characters": 0,
            "total_words": 0
        }
        
        # Process each PDF file
        for i, file in enumerate(files):
            logger.info(f"Processing file {i+1}/{len(files)}: {file.filename}")
            
            # Validate file type
            if not file.filename.lower().endswith('.pdf'):
                logger.warning(f"Skipping non-PDF file: {file.filename}")
                continue
            
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                content = await file.read()
                tmp_file.write(content)
                tmp_file_path = tmp_file.name
            
            try:
                # Validate PDF
                if not validate_pdf(tmp_file_path):
                    logger.warning(f"Invalid PDF file: {file.filename}")
                    continue
                
                # Extract text
                extracted_text = extract_text_from_pdf(tmp_file_path)
                
                if not extracted_text or len(extracted_text.strip()) < 50:
                    logger.warning(f"Insufficient text extracted from: {file.filename}")
                    continue
                
                # Extract syllabus information
                course_data = extract_syllabus_info(extracted_text, api_key, optimize)
                
                if course_data:
                    parsed_courses.append(course_data)
                    total_extraction_stats["successful_extractions"] += 1
                    total_extraction_stats["total_characters"] += len(extracted_text)
                    total_extraction_stats["total_words"] += len(extracted_text.split())
                    
                    logger.info(f"Successfully parsed course: {course_data.get('course_name', 'Unknown')}")
                
            except Exception as e:
                logger.error(f"Error processing {file.filename}: {e}")
                continue
            finally:
                # Clean up temporary file
                try:
                    os.unlink(tmp_file_path)
                except:
                    pass
        
        if not parsed_courses:
            raise HTTPException(
                status_code=400,
                detail="No valid course data extracted from provided PDFs"
            )
        
        logger.info(f"Successfully parsed {len(parsed_courses)} courses")
        
        return ParseResponse(
            success=True,
            message=f"Successfully parsed {len(parsed_courses)} courses",
            data={"courses": parsed_courses},
            extraction_stats=total_extraction_stats
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in parse endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Estimate endpoint - generates combined schedule from multiple PDFs
@app.post("/estimate", response_model=EstimateResponse)
async def estimate_schedule(
    files: List[UploadFile] = File(...),
    optimize: bool = Query(False, description="Enable AI optimization for chapter reordering")
):
    """
    Generate combined daily/weekly schedule from multiple syllabus PDFs.
    
    Args:
        files: List of PDF files to process
        optimize: Whether to use AI optimization for chapter reordering
        
    Returns:
        EstimateResponse: Combined study schedule
    """
    logger.info(f"Generating study schedule for {len(files)} PDF files")
    
    try:
        # Check API key for optimization
        api_key = os.getenv('GEMINI_API_KEY')
        if optimize and not api_key:
            raise HTTPException(
                status_code=400, 
                detail="GEMINI_API_KEY environment variable required for optimization"
            )
        
        # Parse all courses first
        parsed_courses = []
        total_extraction_stats = {
            "total_files": len(files),
            "successful_extractions": 0,
            "total_characters": 0,
            "total_words": 0
        }
        
        # Process each PDF file
        for i, file in enumerate(files):
            logger.info(f"Processing file {i+1}/{len(files)}: {file.filename}")
            
            # Validate file type
            if not file.filename.lower().endswith('.pdf'):
                logger.warning(f"Skipping non-PDF file: {file.filename}")
                continue
            
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                content = await file.read()
                tmp_file.write(content)
                tmp_file_path = tmp_file.name
            
            try:
                # Validate PDF
                if not validate_pdf(tmp_file_path):
                    logger.warning(f"Invalid PDF file: {file.filename}")
                    continue
                
                # Extract text
                extracted_text = extract_text_from_pdf(tmp_file_path)
                
                if not extracted_text or len(extracted_text.strip()) < 50:
                    logger.warning(f"Insufficient text extracted from: {file.filename}")
                    continue
                
                # Extract syllabus information
                course_data = extract_syllabus_info(extracted_text, api_key, optimize)
                
                if course_data:
                    parsed_courses.append(course_data)
                    total_extraction_stats["successful_extractions"] += 1
                    total_extraction_stats["total_characters"] += len(extracted_text)
                    total_extraction_stats["total_words"] += len(extracted_text.split())
                    
                    logger.info(f"Successfully parsed course: {course_data.get('course_name', 'Unknown')}")
                
            except Exception as e:
                logger.error(f"Error processing {file.filename}: {e}")
                continue
            finally:
                # Clean up temporary file
                try:
                    os.unlink(tmp_file_path)
                except:
                    pass
        
        if not parsed_courses:
            raise HTTPException(
                status_code=400,
                detail="No valid course data extracted from provided PDFs"
            )
        
        # Generate combined study schedule
        logger.info(f"Generating study schedule for {len(parsed_courses)} courses")
        schedule_data = estimate_study_schedule(parsed_courses, optimize)
        
        # Format for frontend
        formatted_schedule = format_schedule_for_frontend(schedule_data)
        
        logger.info(f"Generated schedule with {schedule_data['total_weekly_hours']} total weekly hours")
        
        return EstimateResponse(
            success=True,
            message=f"Generated study schedule for {len(parsed_courses)} courses",
            schedule=formatted_schedule,
            total_courses=len(parsed_courses),
            total_weekly_hours=schedule_data['total_weekly_hours']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in estimate endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Additional utility endpoints
@app.get("/health")
def health_check():
    """Detailed health check with system status."""
    api_key_available = bool(os.getenv('GEMINI_API_KEY'))
    
    return {
        "status": "healthy",
        "api_key_configured": api_key_available,
        "optimization_available": api_key_available,
        "version": "1.0.0"
    }

@app.get("/courses/sample")
def get_sample_courses():
    """Get information about available sample courses."""
    sample_dir = "sample_syllabi"
    if not os.path.exists(sample_dir):
        return {"message": "No sample courses available"}
    
    sample_files = [f for f in os.listdir(sample_dir) if f.endswith('.pdf')]
    
    return {
        "sample_courses": sample_files,
        "total_samples": len(sample_files),
        "directory": sample_dir
    }

# Example usage endpoints for testing
@app.post("/test/parse-sample")
async def test_parse_sample(optimize: bool = Query(False)):
    """Test endpoint using sample PDFs."""
    sample_dir = "sample_syllabi"
    if not os.path.exists(sample_dir):
        raise HTTPException(status_code=404, detail="Sample directory not found")
    
    sample_files = [f for f in os.listdir(sample_dir) if f.endswith('.pdf')]
    if not sample_files:
        raise HTTPException(status_code=404, detail="No sample PDF files found")
    
    # Use first sample file
    sample_file = os.path.join(sample_dir, sample_files[0])
    
    try:
        # Extract text
        extracted_text = extract_text_from_pdf(sample_file)
        
        # Extract syllabus information
        api_key = os.getenv('GEMINI_API_KEY')
        course_data = extract_syllabus_info(extracted_text, api_key, optimize)
        
        return ParseResponse(
            success=True,
            message=f"Successfully parsed sample course: {sample_files[0]}",
            data={"course": course_data},
            extraction_stats={"file": sample_files[0], "characters": len(extracted_text)}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing sample: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)