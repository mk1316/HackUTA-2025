#!/usr/bin/env python3
"""
Gemini API Processor for Syllabus Text Analysis
Processes extracted syllabus text using Google Gemini API to produce structured JSON output
"""

import json
import logging
from typing import Dict, List, Optional
import os

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


def analyze_syllabus_text(text: str, api_key: Optional[str] = None) -> Dict:
    """
    Analyze extracted syllabus text using Gemini API and return structured JSON.
    
    Args:
        text (str): The extracted syllabus text to analyze
        api_key (str, optional): Google AI API key. If None, uses environment variable.
        
    Returns:
        dict: Structured JSON with subject, topics, and deadlines
        
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
    
    # Create the prompt
    prompt = f"""
    Analyze the following syllabus text and extract structured information. 
    Return ONLY a valid JSON object with this exact format:
    
    {{
        "subject": "Course Name/Subject",
        "topics": [
            {{"name": "Topic Name", "estimated_time": "Xh"}},
            {{"name": "Another Topic", "estimated_time": "Yh"}}
        ],
        "deadlines": ["YYYY-MM-DD: Event Name", "YYYY-MM-DD: Another Event"]
    }}
    
    Guidelines:
    - Extract the main subject/course name
    - Identify key topics and estimate study time for each (use format like "2h", "3h", "1.5h")
    - Find important deadlines, exams, assignments (use YYYY-MM-DD format)
    - If dates are not in YYYY-MM-DD format, convert them
    - If no specific dates found, use reasonable estimates based on semester timeline
    - Return ONLY the JSON, no additional text
    
    Syllabus text:
    {text[:4000]}  # Limit to first 4000 characters to avoid token limits
    """
    
    try:
        logger.info("Sending request to Gemini API...")
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
        
        # Parse JSON
        try:
            result = json.loads(response_text)
            logger.info("Successfully parsed JSON response")
            return result
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed: {e}")
            logger.error(f"Raw response: {response_text}")
            raise Exception(f"Failed to parse JSON response: {e}")
            
    except Exception as e:
        logger.error(f"Error during Gemini API call: {e}")
        raise Exception(f"Gemini API error: {e}")


def summarize_study_plan(json_data: Dict) -> str:
    """
    Format the structured JSON data into a clean, readable summary.
    
    Args:
        json_data (dict): The structured JSON data from analyze_syllabus_text
        
    Returns:
        str: Formatted summary string for terminal display
    """
    if not json_data:
        return "No study plan data available."
    
    summary = []
    summary.append("=" * 60)
    summary.append("📚 STUDY PLAN SUMMARY")
    summary.append("=" * 60)
    
    # Subject
    subject = json_data.get('subject', 'Unknown Subject')
    summary.append(f"📖 Subject: {subject}")
    summary.append("")
    
    # Topics
    topics = json_data.get('topics', [])
    if topics:
        summary.append("📋 TOPICS TO STUDY:")
        total_time = 0
        for i, topic in enumerate(topics, 1):
            name = topic.get('name', f'Topic {i}')
            time = topic.get('estimated_time', 'Unknown')
            summary.append(f"   {i}. {name} - {time}")
            
            # Calculate total time (extract hours from time string)
            try:
                if 'h' in time.lower():
                    hours = float(time.lower().replace('h', '').strip())
                    total_time += hours
            except (ValueError, AttributeError):
                pass
        
        summary.append(f"\n⏱️  Total Estimated Study Time: {total_time:.1f} hours")
        summary.append("")
    
    # Deadlines
    deadlines = json_data.get('deadlines', [])
    if deadlines:
        summary.append("📅 IMPORTANT DEADLINES:")
        for deadline in deadlines:
            summary.append(f"   • {deadline}")
        summary.append("")
    
    summary.append("=" * 60)
    
    return "\n".join(summary)


def validate_json_structure(json_data: Dict) -> bool:
    """
    Validate that the JSON data has the expected structure.
    
    Args:
        json_data (dict): The JSON data to validate
        
    Returns:
        bool: True if structure is valid, False otherwise
    """
    required_keys = ['subject', 'topics', 'deadlines']
    
    if not isinstance(json_data, dict):
        return False
    
    for key in required_keys:
        if key not in json_data:
            logger.warning(f"Missing required key: {key}")
            return False
    
    # Validate topics structure
    topics = json_data.get('topics', [])
    if not isinstance(topics, list):
        logger.warning("Topics should be a list")
        return False
    
    for topic in topics:
        if not isinstance(topic, dict) or 'name' not in topic or 'estimated_time' not in topic:
            logger.warning("Invalid topic structure")
            return False
    
    # Validate deadlines structure
    deadlines = json_data.get('deadlines', [])
    if not isinstance(deadlines, list):
        logger.warning("Deadlines should be a list")
        return False
    
    return True


# Example usage and testing
if __name__ == "__main__":
    print("=" * 60)
    print("GEMINI SYLLABUS PROCESSOR")
    print("=" * 60)
    
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
        Course: Operating Systems
        Topics covered: Process Management, Memory Management, File Systems
        Midterm Exam: October 15, 2025
        Final Exam: December 5, 2025
        """
        
        try:
            print("\n🧪 Testing with sample text...")
            result = analyze_syllabus_text(sample_text)
            
            print("✅ Analysis completed!")
            print(f"📊 Raw JSON result: {json.dumps(result, indent=2)}")
            
            print("\n📋 Formatted Summary:")
            print(summarize_study_plan(result))
            
        except Exception as e:
            print(f"❌ Error during analysis: {e}")
    
    print("\n" + "=" * 60)
    print("REQUIRED SETUP:")
    print("1. Get API key from: https://makersuite.google.com/app/apikey")
    print("2. Set environment variable: export GEMINI_API_KEY='your-key'")
    print("3. Install dependency: pip install google-generativeai")
    print("=" * 60)
