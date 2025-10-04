#!/usr/bin/env python3
"""
Syllabus Text Extraction Module
Extracts readable text from PDF syllabi using pdfplumber with OCR fallback
"""

import os
import sys
from typing import Optional
import logging

# Configure logging for hackathon debugging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    import pdfplumber
    import pytesseract
    from pdf2image import convert_from_path
    from PIL import Image
    import json
    import google.generativeai as genai
except ImportError as e:
    logger.error(f"Missing required library: {e}")
    logger.error("Please install required packages:")
    logger.error("pip install pdfplumber pdf2image pytesseract Pillow google-generativeai")
    sys.exit(1)


def extract_text(pdf_path: str) -> str:
    """
    Extract text from a PDF syllabus using pdfplumber with OCR fallback.
    
    Args:
        pdf_path (str): Path to the PDF file
        
    Returns:
        str: Extracted text as a single string
        
    Raises:
        FileNotFoundError: If PDF file doesn't exist
        Exception: For other extraction errors
    """
    logger.info(f"Starting text extraction from: {pdf_path}")
    
    # Check if file exists
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    # Try pdfplumber first (faster for text-based PDFs)
    text = _extract_with_pdfplumber(pdf_path)
    
    # Check if text extraction was successful
    if text and len(text.strip()) >= 50:
        logger.info(f"Successfully extracted {len(text)} characters using pdfplumber")
        return text.strip()
    
    # Fallback to OCR if text is empty or too short
    logger.info("Text too short or empty, falling back to OCR...")
    text = _extract_with_ocr(pdf_path)
    
    if text and len(text.strip()) >= 50:
        logger.info(f"Successfully extracted {len(text)} characters using OCR")
        return text.strip()
    
    # If both methods fail
    logger.warning("Both pdfplumber and OCR failed to extract sufficient text")
    return text.strip() if text else ""


def _extract_with_pdfplumber(pdf_path: str) -> str:
    """
    Extract text using pdfplumber library.
    
    Args:
        pdf_path (str): Path to the PDF file
        
    Returns:
        str: Extracted text
    """
    try:
        logger.info("Attempting text extraction with pdfplumber...")
        text_parts = []
        
        with pdfplumber.open(pdf_path) as pdf:
            logger.info(f"PDF has {len(pdf.pages)} pages")
            
            for page_num, page in enumerate(pdf.pages, 1):
                logger.info(f"Processing page {page_num}...")
                page_text = page.extract_text()
                
                if page_text:
                    text_parts.append(page_text)
                    logger.info(f"Extracted {len(page_text)} characters from page {page_num}")
                else:
                    logger.warning(f"No text found on page {page_num}")
        
        return "\n".join(text_parts)
        
    except Exception as e:
        logger.error(f"Error extracting text with pdfplumber: {e}")
        return ""


def _extract_with_ocr(pdf_path: str) -> str:
    """
    Extract text using OCR (pytesseract) after converting PDF to images.
    
    Args:
        pdf_path (str): Path to the PDF file
        
    Returns:
        str: Extracted text
    """
    try:
        logger.info("Converting PDF to images for OCR...")
        
        # Convert PDF to images
        images = convert_from_path(pdf_path, dpi=300)  # Higher DPI for better OCR
        logger.info(f"Converted PDF to {len(images)} images")
        
        text_parts = []
        
        for i, image in enumerate(images, 1):
            logger.info(f"Running OCR on image {i}/{len(images)}...")
            
            # Convert PIL image to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Extract text using pytesseract
            page_text = pytesseract.image_to_string(image, lang='eng')
            
            if page_text.strip():
                text_parts.append(page_text.strip())
                logger.info(f"OCR extracted {len(page_text)} characters from image {i}")
            else:
                logger.warning(f"No text found in image {i}")
        
        return "\n".join(text_parts)
        
    except Exception as e:
        logger.error(f"Error during OCR extraction: {e}")
        return ""


def validate_pdf(pdf_path: str) -> bool:
    """
    Validate if the PDF file is readable.
    
    Args:
        pdf_path (str): Path to the PDF file
        
    Returns:
        bool: True if PDF is valid, False otherwise
    """
    try:
        with pdfplumber.open(pdf_path) as pdf:
            # Try to access the first page
            if len(pdf.pages) > 0:
                _ = pdf.pages[0]
                return True
        return False
    except Exception as e:
        logger.error(f"PDF validation failed: {e}")
        return False


def extract_optimized_syllabus_info(text: str, api_key: Optional[str] = None) -> dict:
    """
    Extract and optimize syllabus information using Gemini AI with intelligent chapter reordering.
    
    Args:
        text (str): The extracted syllabus text to analyze
        api_key (str, optional): Google AI API key. If None, uses environment variable.
        
    Returns:
        dict: Optimized JSON with reordered chapters and study time suggestions
        
    Raises:
        ValueError: If text is empty or API key is missing
        Exception: For API errors or JSON parsing failures
    """
    if not text or len(text.strip()) < 10:
        raise ValueError("Text is too short or empty for meaningful analysis")
    
    # Configure Gemini API
    if api_key is None:
        api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        raise ValueError("No API key provided. Set GEMINI_API_KEY environment variable.")
    
    genai.configure(api_key=api_key)
    logger.info("Gemini API configured for optimized extraction")
    
    # Create the model
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # Create the comprehensive optimization prompt
    prompt = f"""
    Analyze the following syllabus text and extract comprehensive course information with intelligent optimization.
    Return ONLY a valid JSON object with this exact structure:
    
    {{
        "course_name": "Full Course Name and Number",
        "professor": {{
            "name": "Professor Full Name",
            "email": "professor@university.edu",
            "office_hours": "Days and Times"
        }},
        "class_schedule": "Class meeting days and times",
        "chapters": [
            {{"name": "Chapter Title", "suggested_order": 1, "weekly_hours": 3}},
            {{"name": "Another Chapter", "suggested_order": 2, "weekly_hours": 2}}
        ],
        "homework": [
            {{"title": "Assignment Title", "due_date": "YYYY-MM-DD"}},
            {{"title": "Another Assignment", "due_date": "YYYY-MM-DD"}}
        ],
        "exams": [
            {{"type": "Midterm/Final/Quiz", "date": "YYYY-MM-DD"}},
            {{"type": "Another Exam", "date": "YYYY-MM-DD"}}
        ],
        "projects": [
            {{"title": "Project Title", "due_date": "YYYY-MM-DD"}},
            {{"title": "Another Project", "due_date": "YYYY-MM-DD"}}
        ],
        "academic_dates": [
            "YYYY-MM-DD: Important Academic Event",
            "YYYY-MM-DD: Another Important Date"
        ]
    }}
    
    CRITICAL OPTIMIZATION REQUIREMENTS:
    1. REORDER CHAPTERS INTELLIGENTLY:
       - Start with foundational concepts (basics, introductions)
       - Progress to intermediate topics
       - End with advanced/complex topics
       - Consider logical dependencies between topics
       - Assign suggested_order: 1, 2, 3, etc. based on optimal learning sequence
    
    2. SUGGEST WEEKLY STUDY HOURS:
       - Assign realistic weekly_hours (1-8 hours per week)
       - Consider topic complexity and difficulty
       - Factor in typical student workload
       - Balance across all chapters
    
    3. EXTRACTION GUIDELINES:
       - Extract complete course name and number
       - Find professor/instructor name, email, and office hours
       - Identify class meeting schedule (days, times, location if available)
       - List all chapters/topics with intelligent reordering
       - Extract all homework assignments with due dates
       - Find all exams, midterms, finals, and quizzes with dates
       - Identify projects and their due dates
       - Include important academic dates (drop deadlines, refund dates, etc.)
       - Convert all dates to YYYY-MM-DD format
       - Return ONLY the JSON, no additional text or explanations
    
    Syllabus text:
    {text[:6000]}
    """
    
    try:
        logger.info("Sending optimized syllabus analysis request to Gemini API...")
        response = model.generate_content(prompt)
        
        if not response.text:
            raise Exception("Empty response from Gemini API")
        
        logger.info("Received optimized response from Gemini API")
        
        # Clean the response text
        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        # Parse JSON with error handling
        try:
            result = json.loads(response_text)
            logger.info("Successfully parsed optimized JSON response")
            
            # Log reordering information
            chapters = result.get('chapters', [])
            if chapters:
                logger.info("Chapter reordering completed:")
                for chapter in chapters:
                    name = chapter.get('name', 'Unknown')
                    order = chapter.get('suggested_order', 0)
                    hours = chapter.get('weekly_hours', 0)
                    logger.info(f"  Order {order}: {name} ({hours}h/week)")
            
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed: {e}")
            logger.error(f"Raw response: {response_text}")
            # Try to extract JSON from embedded text
            try:
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                if start_idx != -1 and end_idx > start_idx:
                    json_text = response_text[start_idx:end_idx]
                    result = json.loads(json_text)
                    logger.info("Successfully extracted JSON from embedded text")
                    return result
            except:
                pass
            raise Exception(f"Failed to parse JSON response: {e}")
            
    except Exception as e:
        logger.error(f"Error during optimized Gemini API call: {e}")
        raise Exception(f"Gemini API error: {e}")


def print_optimized_schedule(data: dict) -> str:
    """
    Format the optimized syllabus data into a clean, readable schedule.
    
    Args:
        data (dict): The optimized JSON data from extract_optimized_syllabus_info
        
    Returns:
        str: Formatted schedule string for terminal display
    """
    if not data:
        return "No optimized schedule data available."
    
    schedule = []
    schedule.append("=" * 80)
    schedule.append("📚 OPTIMIZED STUDY SCHEDULE")
    schedule.append("=" * 80)
    
    # Course Information
    course_name = data.get('course_name', 'Unknown Course')
    schedule.append(f"📖 Course: {course_name}")
    schedule.append("")
    
    # Professor Information
    professor = data.get('professor', {})
    if professor:
        schedule.append("👨‍🏫 PROFESSOR INFORMATION:")
        schedule.append(f"   Name: {professor.get('name', 'Not specified')}")
        schedule.append(f"   Email: {professor.get('email', 'Not specified')}")
        schedule.append(f"   Office Hours: {professor.get('office_hours', 'Not specified')}")
        schedule.append("")
    
    # Class Schedule
    class_schedule = data.get('class_schedule', 'Not specified')
    schedule.append(f"📅 Class Schedule: {class_schedule}")
    schedule.append("")
    
    # Optimized Chapters
    chapters = data.get('chapters', [])
    if chapters:
        schedule.append("📋 OPTIMIZED LEARNING SEQUENCE:")
        total_hours = 0
        for chapter in sorted(chapters, key=lambda x: x.get('suggested_order', 0)):
            name = chapter.get('name', 'Unknown Chapter')
            order = chapter.get('suggested_order', 0)
            hours = chapter.get('weekly_hours', 0)
            total_hours += hours
            
            schedule.append(f"   {order}. {name}")
            schedule.append(f"      ⏱️  {hours} hours/week")
        
        schedule.append(f"\n📊 TOTAL WEEKLY STUDY TIME: {total_hours} hours")
        schedule.append("")
    
    # Homework
    homework = data.get('homework', [])
    if homework:
        schedule.append("📝 HOMEWORK ASSIGNMENTS:")
        for i, hw in enumerate(homework, 1):
            title = hw.get('title', f'Assignment {i}')
            due = hw.get('due_date', 'TBD')
            schedule.append(f"   {i}. {title} - Due: {due}")
        schedule.append("")
    
    # Exams
    exams = data.get('exams', [])
    if exams:
        schedule.append("📊 EXAMS:")
        for exam in exams:
            exam_type = exam.get('type', 'Exam')
            date = exam.get('date', 'TBD')
            schedule.append(f"   • {exam_type}: {date}")
        schedule.append("")
    
    # Projects
    projects = data.get('projects', [])
    if projects:
        schedule.append("🔬 PROJECTS:")
        for i, project in enumerate(projects, 1):
            title = project.get('title', f'Project {i}')
            due = project.get('due_date', 'TBD')
            schedule.append(f"   {i}. {title} - Due: {due}")
        schedule.append("")
    
    # Academic Dates
    academic_dates = data.get('academic_dates', [])
    if academic_dates:
        schedule.append("📅 IMPORTANT ACADEMIC DATES:")
        for date in academic_dates:
            schedule.append(f"   • {date}")
        schedule.append("")
    
    schedule.append("=" * 80)
    
    return "\n".join(schedule)


def get_extraction_stats(text: str) -> dict:
    """
    Get statistics about the extracted text.
    
    Args:
        text (str): Extracted text
        
    Returns:
        dict: Statistics about the text
    """
    if not text:
        return {
            "character_count": 0,
            "word_count": 0,
            "line_count": 0,
            "is_empty": True
        }
    
    lines = text.split('\n')
    words = text.split()
    
    return {
        "character_count": len(text),
        "word_count": len(words),
        "line_count": len(lines),
        "is_empty": len(text.strip()) == 0,
        "avg_words_per_line": len(words) / len(lines) if lines else 0
    }


# Example usage and testing
if __name__ == "__main__":
    # Test the extraction function
    test_pdf = "sampleSyllabus/sample2.pdf"
    
    print("=" * 80)
    print("ENHANCED SYLLABUS TEXT EXTRACTION MODULE")
    print("=" * 80)
    
    try:
        # Check if test file exists
        if not os.path.exists(test_pdf):
            print(f"⚠️  Test file not found: {test_pdf}")
            print("Please create a 'sampleSyllabus' directory and add a test PDF file.")
            print("Or modify the test_pdf variable to point to an existing PDF file.")
        else:
            print(f"📄 Extracting text from: {test_pdf}")
            
            # Validate PDF first
            if validate_pdf(test_pdf):
                print("✅ PDF validation passed")
            else:
                print("⚠️  PDF validation failed, but attempting extraction anyway...")
            
            # Extract text
            extracted_text = extract_text(test_pdf)
            
            # Get statistics
            stats = get_extraction_stats(extracted_text)
            
            print("\n📊 EXTRACTION STATISTICS:")
            print(f"   Character count: {stats['character_count']}")
            print(f"   Word count: {stats['word_count']}")
            print(f"   Line count: {stats['line_count']}")
            print(f"   Average words per line: {stats['avg_words_per_line']:.1f}")
            
            if stats['is_empty']:
                print("⚠️  WARNING: No text was extracted!")
            else:
                print("✅ Text extraction completed successfully!")
                
                # Test optimized extraction if API key is available
                api_key = os.getenv('GEMINI_API_KEY')
                if api_key:
                    print("\n🤖 Testing optimized syllabus analysis...")
                    try:
                        optimized_data = extract_optimized_syllabus_info(extracted_text, api_key)
                        
                        print("✅ Optimized analysis completed!")
                        print("\n📊 RAW OPTIMIZED JSON:")
                        print(json.dumps(optimized_data, indent=2))
                        
                        print("\n📋 OPTIMIZED SCHEDULE:")
                        print(print_optimized_schedule(optimized_data))
                        
                        # Save optimized results
                        with open("optimized_analysis_result.json", 'w') as f:
                            json.dump(optimized_data, f, indent=2)
                        print("\n💾 Optimized results saved to: optimized_analysis_result.json")
                        
                    except Exception as e:
                        print(f"❌ Optimized analysis failed: {e}")
                else:
                    print("\n⚠️  GEMINI_API_KEY not set - skipping optimized analysis")
                    print("Set GEMINI_API_KEY environment variable to enable AI optimization")
                
    except FileNotFoundError as e:
        print(f"❌ File not found: {e}")
    except Exception as e:
        print(f"❌ Error during extraction: {e}")
        logger.exception("Full error details:")
    
    print("\n" + "=" * 80)
    print("REQUIRED PACKAGES:")
    print("pip install pdfplumber pdf2image pytesseract Pillow google-generativeai")
    print("=" * 80)
