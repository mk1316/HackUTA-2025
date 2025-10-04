#!/usr/bin/env python3
"""
Gemini Deep Syllabus Extractor
Performs comprehensive syllabus parsing using Google Gemini API to extract detailed course information
"""

import json
import logging
import os
from typing import Dict, List, Optional
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
except ImportError:
    logger.error("Missing required library: google-generativeai")
    logger.error("Please install: pip install google-generativeai")
    raise


def configure_gemini_api(api_key: Optional[str] = None) -> None:
    """
    Configure the Gemini API with the provided API key.
    
    Args:
        api_key (str, optional): Google AI API key. If None, tries to get from environment variable GEMINI_API_KEY.
        
    Raises:
        ValueError: If no API key is provided or found in environment.
    """
    if api_key is None:
        api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        raise ValueError(
            "No API key provided. Set GEMINI_API_KEY environment variable or pass api_key parameter."
        )
    
    genai.configure(api_key=api_key)
    logger.info("Gemini API configured successfully")


def extract_syllabus_info(text: str, api_key: Optional[str] = None) -> Dict:
    """
    Extract comprehensive syllabus information using Gemini API.
    
    Args:
        text (str): The extracted syllabus text to analyze
        api_key (str, optional): Google AI API key. If None, uses environment variable.
        
    Returns:
        dict: Structured JSON with detailed course information including:
            - Course name
            - Professor details (name, email, office hours)
            - Class schedule
            - Chapters with dates
            - Homework assignments
            - Exams and quizzes
            - Projects
            - Important academic dates
        
    Raises:
        ValueError: If text is empty or API key is missing
        Exception: For API errors or JSON parsing failures
    """
    if not text or len(text.strip()) < 10:
        raise ValueError("Text is too short or empty for meaningful analysis")
    
    # Configure API
    configure_gemini_api(api_key)
    
    # Create the model
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # Create the comprehensive prompt
    prompt = f"""
    Analyze the following syllabus text and extract comprehensive course information.
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
            {{"name": "Chapter Title", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD"}},
            {{"name": "Another Chapter", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD"}}
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
    
    Guidelines:
    - Extract the complete course name and number
    - Find professor/instructor name, email, and office hours
    - Identify class meeting schedule (days, times, location if available)
    - List all chapters/topics with their start and end dates
    - Extract all homework assignments with due dates
    - Find all exams, midterms, finals, and quizzes with dates
    - Identify projects and their due dates
    - Include important academic dates (drop deadlines, refund dates, etc.)
    - Convert all dates to YYYY-MM-DD format
    - If specific dates are not provided, estimate based on semester timeline
    - Return ONLY the JSON, no additional text or explanations
    
    Syllabus text:
    {text[:6000]}  # Increased limit for more comprehensive analysis
    """
    
    try:
        logger.info("Sending comprehensive syllabus analysis request to Gemini API...")
        response = model.generate_content(prompt)
        
        if not response.text:
            raise Exception("Empty response from Gemini API")
        
        logger.info("Received response from Gemini API")
        
        # Clean the response text (remove markdown formatting if present)
        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        # Parse JSON with error handling
        try:
            result = json.loads(response_text)
            logger.info("Successfully parsed comprehensive JSON response")
            return result
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed: {e}")
            logger.error(f"Raw response: {response_text}")
            # Try to extract JSON from the response if it's embedded in text
            try:
                # Look for JSON-like content between curly braces
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
        logger.error(f"Error during Gemini API call: {e}")
        raise Exception(f"Gemini API error: {e}")


def summarize_extraction(data: Dict) -> str:
    """
    Format the extracted syllabus data into a clean, readable summary.
    
    Args:
        data (dict): The structured JSON data from extract_syllabus_info
        
    Returns:
        str: Formatted summary string for terminal display
    """
    if not data:
        return "No syllabus data available."
    
    summary = []
    summary.append("=" * 80)
    summary.append("📚 COMPREHENSIVE SYLLABUS EXTRACTION SUMMARY")
    summary.append("=" * 80)
    
    # Course Information
    course_name = data.get('course_name', 'Unknown Course')
    summary.append(f"📖 Course: {course_name}")
    summary.append("")
    
    # Professor Information
    professor = data.get('professor', {})
    if professor:
        summary.append("👨‍🏫 PROFESSOR INFORMATION:")
        summary.append(f"   Name: {professor.get('name', 'Not specified')}")
        summary.append(f"   Email: {professor.get('email', 'Not specified')}")
        summary.append(f"   Office Hours: {professor.get('office_hours', 'Not specified')}")
        summary.append("")
    
    # Class Schedule
    schedule = data.get('class_schedule', 'Not specified')
    summary.append(f"📅 Class Schedule: {schedule}")
    summary.append("")
    
    # Chapters
    chapters = data.get('chapters', [])
    if chapters:
        summary.append("📋 CHAPTERS/TOPICS:")
        for i, chapter in enumerate(chapters, 1):
            name = chapter.get('name', f'Chapter {i}')
            start = chapter.get('start_date', 'TBD')
            end = chapter.get('end_date', 'TBD')
            summary.append(f"   {i}. {name}")
            summary.append(f"      📅 {start} → {end}")
        summary.append("")
    
    # Homework
    homework = data.get('homework', [])
    if homework:
        summary.append("📝 HOMEWORK ASSIGNMENTS:")
        for i, hw in enumerate(homework, 1):
            title = hw.get('title', f'Assignment {i}')
            due = hw.get('due_date', 'TBD')
            summary.append(f"   {i}. {title} - Due: {due}")
        summary.append("")
    
    # Exams
    exams = data.get('exams', [])
    if exams:
        summary.append("📊 EXAMS:")
        for exam in exams:
            exam_type = exam.get('type', 'Exam')
            date = exam.get('date', 'TBD')
            summary.append(f"   • {exam_type}: {date}")
        summary.append("")
    
    # Projects
    projects = data.get('projects', [])
    if projects:
        summary.append("🔬 PROJECTS:")
        for i, project in enumerate(projects, 1):
            title = project.get('title', f'Project {i}')
            due = project.get('due_date', 'TBD')
            summary.append(f"   {i}. {title} - Due: {due}")
        summary.append("")
    
    # Academic Dates
    academic_dates = data.get('academic_dates', [])
    if academic_dates:
        summary.append("📅 IMPORTANT ACADEMIC DATES:")
        for date in academic_dates:
            summary.append(f"   • {date}")
        summary.append("")
    
    # Summary Statistics
    total_items = len(chapters) + len(homework) + len(exams) + len(projects)
    summary.append("📊 EXTRACTION SUMMARY:")
    summary.append(f"   • Chapters/Topics: {len(chapters)}")
    summary.append(f"   • Homework Assignments: {len(homework)}")
    summary.append(f"   • Exams: {len(exams)}")
    summary.append(f"   • Projects: {len(projects)}")
    summary.append(f"   • Total Items: {total_items}")
    summary.append("")
    
    summary.append("=" * 80)
    
    return "\n".join(summary)


def validate_extraction_data(data: Dict) -> bool:
    """
    Validate that the extracted data has the expected structure.
    
    Args:
        data (dict): The extracted data to validate
        
    Returns:
        bool: True if structure is valid, False otherwise
    """
    required_keys = ['course_name']
    optional_keys = ['professor', 'class_schedule', 'chapters', 'homework', 'exams', 'projects', 'academic_dates']
    
    if not isinstance(data, dict):
        logger.warning("Data should be a dictionary")
        return False
    
    for key in required_keys:
        if key not in data:
            logger.warning(f"Missing required key: {key}")
            return False
    
    # Validate professor structure if present
    professor = data.get('professor', {})
    if professor and not isinstance(professor, dict):
        logger.warning("Professor data should be a dictionary")
        return False
    
    # Validate list structures
    list_keys = ['chapters', 'homework', 'exams', 'projects', 'academic_dates']
    for key in list_keys:
        items = data.get(key, [])
        if not isinstance(items, list):
            logger.warning(f"{key} should be a list")
            return False
    
    return True


# Example usage and testing
if __name__ == "__main__":
    print("=" * 80)
    print("GEMINI DEEP SYLLABUS EXTRACTOR")
    print("=" * 80)
    
    # Check for API key
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("⚠️  GEMINI_API_KEY environment variable not set")
        print("Please set your Google AI API key:")
        print("export GEMINI_API_KEY='your-api-key-here'")
        print("")
        print("Get your API key from: https://makersuite.google.com/app/apikey")
    else:
        print("✅ API key found in environment")
        
        # Test with sample text
        sample_text = """
        Course: CSE 4361/5322 Software Design Patterns
        Instructor: Dr. John Smith
        Email: jsmith@uta.edu
        Office Hours: Tuesday/Thursday 2:00-4:00 PM
        Class Time: Monday/Wednesday 3:00-4:20 PM
        
        Course Schedule:
        Week 1-2: Introduction to Design Patterns (Aug 26 - Sep 6)
        Week 3-4: Gang of Four Patterns (Sep 9 - Sep 20)
        Week 5-6: Creational Patterns (Sep 23 - Oct 4)
        
        Assignments:
        HW1: Pattern Analysis - Due Sep 10
        HW2: Implementation Project - Due Oct 15
        
        Exams:
        Midterm: October 15
        Final Exam: December 10
        
        Projects:
        Team Project: Design Pattern Implementation - Due Dec 3
        
        Important Dates:
        Aug 20: Background Survey Due
        Sep 17: Team Project Proposal Due
        Dec 4: Last Day to Drop
        """
        
        try:
            print("\n🧪 Testing comprehensive extraction...")
            result = extract_syllabus_info(sample_text)
            
            print("✅ Extraction completed!")
            print(f"📊 Raw JSON result: {json.dumps(result, indent=2)}")
            
            print("\n📋 Formatted Summary:")
            print(summarize_extraction(result))
            
            # Validate the data
            if validate_extraction_data(result):
                print("\n✅ Data structure validation passed!")
            else:
                print("\n⚠️  Data structure validation failed!")
                
        except Exception as e:
            print(f"❌ Error during extraction: {e}")
    
    print("\n" + "=" * 80)
    print("REQUIRED SETUP:")
    print("1. Get API key from: https://makersuite.google.com/app/apikey")
    print("2. Set environment variable: export GEMINI_API_KEY='your-key'")
    print("3. Install dependency: pip install google-generativeai")
    print("=" * 80)
