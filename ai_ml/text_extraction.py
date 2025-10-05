#!/usr/bin/env python3
"""
PDF Text Extraction Module
Extracts text from PDF files with OCR fallback
"""

import os
import logging
from typing import Optional
import pdfplumber
import pytesseract
from pdf2image import convert_from_path
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from PDF using pdfplumber with OCR fallback.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        Extracted text as string
    """
    try:
        logger.info(f"Extracting text from: {pdf_path}")
        
        # Try pdfplumber first
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        
        # Check if we got enough text
        if len(text.strip()) >= 50:
            logger.info(f"Successfully extracted {len(text)} characters using pdfplumber")
            return text
        
        # Fallback to OCR
        logger.info("Insufficient text from pdfplumber, trying OCR...")
        images = convert_from_path(pdf_path)
        
        for i, image in enumerate(images):
            logger.info(f"Processing page {i+1}/{len(images)} with OCR")
            page_text = pytesseract.image_to_string(image)
            text += page_text + "\n"
        
        logger.info(f"OCR extraction completed: {len(text)} characters")
        return text
        
    except Exception as e:
        logger.error(f"Error extracting text from {pdf_path}: {e}")
        return ""

def validate_pdf(pdf_path: str) -> bool:
    """
    Validate that the file is a readable PDF.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        True if valid PDF, False otherwise
    """
    try:
        with pdfplumber.open(pdf_path) as pdf:
            return len(pdf.pages) > 0
    except:
        return False

def extract_syllabus_info(text: str, api_key: Optional[str] = None, optimize: bool = False) -> dict:
    """
    Extract structured syllabus information using Gemini AI.
    
    Args:
        text: Extracted text from PDF
        api_key: Gemini API key
        optimize: Whether to use AI optimization
        
    Returns:
        Structured course data
    """
    if not api_key:
        logger.warning("No API key provided, returning basic extraction")
        return {
            "course_name": "Unknown Course",
            "professor": {"name": "Unknown", "email": "", "office_hours": ""},
            "class_schedule": "Unknown",
            "chapters": [],
            "homework": [],
            "exams": [],
            "projects": [],
            "academic_dates": []
        }
    
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
        You are analyzing a course syllabus. Extract ALL assignments, exams, projects, and important dates from this text.
        
        The text may contain tables with columns like "Class Week", "Day", "Topic(s)", and "Assignments".
        The "Assignments" column is CRUCIAL - it contains phrases like:
        - "Assigned" followed by assignment names
        - "Due by 11:59PM on MM/DD:" followed by items
        - Assignment names with due dates in parentheses
        
        EXAMPLES of what to extract:
        - "Due by 11:59PM on 08/24: Self-intro" → extract "Self-intro" with due date 2025-08-24
        - "Due by 11:59PM on 09/12: Sprint Plan" → extract "Sprint Plan" with due date 2025-09-12
        - "SRS Assigned" and "Due by 11:59PM on 09/19: CSE Advising Survey" → extract "CSE Advising Survey" with due date 2025-09-19
        
        Look through the ENTIRE text carefully and extract EVERY assignment, exam, and project you find.
        
        FULL SYLLABUS TEXT:
        {text}
        
        CRITICAL INSTRUCTIONS:
        1. Read through the ENTIRE text above - do not stop early
        2. FOCUS ON THE "ASSIGNMENTS" COLUMN - look for phrases like "Due by", "Assigned", and specific due dates
        3. Find EVERY assignment, homework, quiz with due dates (look for: "Team:", "Individual:", "HW:", "Assignment", "Assigned", "Due by")
        4. Find ALL exams (Midterm, Final, etc.) and their dates
        5. Find ALL projects, presentations, reports, and their due dates
        6. Extract team member evaluations, sprint plans, sprint reviews, and any other graded work
        7. Include the full title/description for each item (e.g., "Sprint Plan", "Project Charter", "Individual Report")
        8. Convert all dates to YYYY-MM-DD format (assume year 2025 if not specified)
        9. If a date range is given (e.g., "8/18-8/22"), use the END date as the due date
        10. Pay special attention to items with time stamps like "11:59PM" - these are important deadlines
        
        Return ONLY valid JSON in this exact format (no markdown, no extra text):
        {{
            "course_name": "Full Course Name",
            "course_code": "Course Code",
            "professor": {{
                "name": "Professor Name",
                "email": "email@domain.com",
                "office_hours": "Office hours description"
            }},
            "class_schedule": "Class meeting schedule",
            "chapters": [
                {{"name": "Chapter/Topic Name", "suggested_order": 1, "weekly_hours": 2}}
            ],
            "homework": [
                {{
                    "title": "Assignment Title",
                    "due_date": "YYYY-MM-DD",
                    "description": "Assignment description",
                    "points": 10,
                    "weight": "10%"
                }}
            ],
            "exams": [
                {{
                    "type": "Midterm/Final/Quiz",
                    "date": "YYYY-MM-DD",
                    "description": "Exam details",
                    "points": 100,
                    "weight": "30%"
                }}
            ],
            "projects": [
                {{
                    "title": "Project Title",
                    "due_date": "YYYY-MM-DD",
                    "description": "Project description",
                    "points": 100,
                    "weight": "20%"
                }}
            ],
            "academic_dates": [
                {{
                    "date": "YYYY-MM-DD",
                    "description": "What happens on this date"
                }}
            ]
        }}
        """
        
        response = model.generate_content(prompt)
        
        # Parse JSON response
        import json
        import re
        try:
            # Log the raw response for debugging
            logger.info(f"Gemini raw response (first 500 chars): {response.text[:500]}")
            
            # Strip markdown code blocks if present
            response_text = response.text.strip()
            if response_text.startswith('```'):
                # Remove ```json or ``` at start and ``` at end
                response_text = re.sub(r'^```(?:json)?\s*', '', response_text)
                response_text = re.sub(r'\s*```$', '', response_text)
            
            data = json.loads(response_text)
            logger.info("Successfully extracted syllabus information")
            return data
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response. Error: {e}")
            logger.error(f"Raw response: {response.text[:1000]}")
            return {"error": "Failed to parse AI response", "raw_response": response.text[:500]}
            
    except Exception as e:
        logger.error(f"Error in AI extraction: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    # Test the extraction
    test_pdf = "sample_syllabi/sample1.pdf"
    if os.path.exists(test_pdf):
        text = extract_text_from_pdf(test_pdf)
        print(f"Extracted text preview: {text[:200]}...")
    else:
        print(f"Test PDF not found: {test_pdf}")