#!/usr/bin/env python3
"""
Gemini AI Teacher Module
Provides AI optimization and study recommendations
"""

import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

def optimize_course_structure(course_data: Dict[str, Any], api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Optimize course structure using AI recommendations.
    
    Args:
        course_data: Course information dictionary
        api_key: Gemini API key
        
    Returns:
        Optimized course data
    """
    if not api_key:
        logger.warning("No API key provided, returning original data")
        return course_data
    
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
        Optimize this course structure for better learning:
        
        Course: {course_data.get('course_name', 'Unknown')}
        Chapters: {course_data.get('chapters', [])}
        
        Please reorder chapters for optimal learning sequence and suggest weekly study hours.
        Return the same JSON format with updated suggested_order and weekly_hours.
        """
        
        response = model.generate_content(prompt)
        
        # Parse and return optimized data
        import json
        try:
            optimized_data = json.loads(response.text)
            logger.info("Successfully optimized course structure")
            return optimized_data
        except json.JSONDecodeError:
            logger.warning("Failed to parse optimization response")
            return course_data
            
    except Exception as e:
        logger.error(f"Error in course optimization: {e}")
        return course_data

def generate_study_recommendations(courses: List[Dict[str, Any]], api_key: Optional[str] = None) -> List[str]:
    """
    Generate personalized study recommendations.
    
    Args:
        courses: List of course data
        api_key: Gemini API key
        
    Returns:
        List of study recommendations
    """
    if not api_key:
        return ["Study regularly and stay organized", "Review material before exams"]
    
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        course_names = [course.get('course_name', 'Unknown') for course in courses]
        
        prompt = f"""
        Generate personalized study recommendations for these courses:
        {', '.join(course_names)}
        
        Provide 3-5 specific, actionable study tips.
        """
        
        response = model.generate_content(prompt)
        
        # Parse recommendations
        recommendations = response.text.strip().split('\n')
        recommendations = [rec.strip() for rec in recommendations if rec.strip()]
        
        logger.info(f"Generated {len(recommendations)} study recommendations")
        return recommendations
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        return ["Study regularly and stay organized"]

def analyze_difficulty_level(course_data: Dict[str, Any]) -> str:
    """
    Analyze course difficulty level.
    
    Args:
        course_data: Course information
        
    Returns:
        Difficulty level (beginner/intermediate/advanced)
    """
    chapters = course_data.get('chapters', [])
    total_hours = sum(chapter.get('weekly_hours', 2) for chapter in chapters)
    
    if total_hours <= 6:
        return "beginner"
    elif total_hours <= 12:
        return "intermediate"
    else:
        return "advanced"

def suggest_study_schedule(courses: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Suggest optimal study schedule.
    
    Args:
        courses: List of course data
        
    Returns:
        Suggested schedule
    """
    total_hours = sum(
        sum(chapter.get('weekly_hours', 2) for chapter in course.get('chapters', []))
        for course in courses
    )
    
    # Distribute hours across days
    hours_per_day = total_hours / 7
    
    schedule = {
        "total_weekly_hours": total_hours,
        "hours_per_day": round(hours_per_day, 1),
        "recommended_sessions": "2-3 sessions per day",
        "break_duration": "10-15 minutes between sessions"
    }
    
    return schedule

if __name__ == "__main__":
    # Test with sample data
    sample_course = {
        "course_name": "Test Course",
        "chapters": [
            {"name": "Introduction", "weekly_hours": 2},
            {"name": "Advanced Topics", "weekly_hours": 4}
        ]
    }
    
    difficulty = analyze_difficulty_level(sample_course)
    print(f"Course difficulty: {difficulty}")