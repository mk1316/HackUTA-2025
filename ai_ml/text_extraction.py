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
        Extract structured information from this syllabus text:
        
        {text[:4000]}  # Limit text for API
        
        Return JSON in this format:
        {{
            "course_name": "Course Name",
            "professor": {{"name": "Name", "email": "email@domain.com", "office_hours": "Hours"}},
            "class_schedule": "Schedule",
            "chapters": [{{"name": "Chapter Name", "suggested_order": 1, "weekly_hours": 2}}],
            "homework": [{{"title": "Assignment", "due_date": "YYYY-MM-DD"}}],
            "exams": [{{"type": "Midterm", "date": "YYYY-MM-DD"}}],
            "projects": [{{"title": "Project", "due_date": "YYYY-MM-DD"}}],
            "academic_dates": ["Important dates"]
        }}
        """
        
        response = model.generate_content(prompt)
        
        # Parse JSON response
        import json
        try:
            data = json.loads(response.text)
            logger.info("Successfully extracted syllabus information")
            return data
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON response")
            return {"error": "Failed to parse AI response"}
            
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