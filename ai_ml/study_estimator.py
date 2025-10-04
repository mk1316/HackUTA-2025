#!/usr/bin/env python3
"""
Study Schedule Estimator
Generates study schedules from multiple course data
"""

import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

def estimate_study_schedule(courses: List[Dict[str, Any]], optimize: bool = False) -> Dict[str, Any]:
    """
    Generate study schedule from multiple courses.
    
    Args:
        courses: List of course data dictionaries
        optimize: Whether to use AI optimization
        
    Returns:
        Combined study schedule
    """
    logger.info(f"Generating study schedule for {len(courses)} courses")
    
    # Calculate total weekly hours
    total_weekly_hours = sum(
        sum(chapter.get('weekly_hours', 2) for chapter in course.get('chapters', []))
        for course in courses
    )
    
    # Generate daily schedule
    daily_schedule = generate_daily_schedule(courses, total_weekly_hours)
    
    # Generate weekly schedule
    weekly_schedule = generate_weekly_schedule(courses)
    
    # Collect all deadlines
    deadlines = collect_deadlines(courses)
    
    return {
        "total_weekly_hours": total_weekly_hours,
        "daily_schedule": daily_schedule,
        "weekly_schedule": weekly_schedule,
        "deadlines": deadlines,
        "courses": courses
    }

def generate_daily_schedule(courses: List[Dict[str, Any]], total_hours: int) -> Dict[str, List[Dict]]:
    """Generate daily study schedule."""
    days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    daily_schedule = {day: [] for day in days}
    
    hours_per_day = total_hours / 7
    
    for day in days:
        for course in courses:
            course_hours = hours_per_day / len(courses)
            daily_schedule[day].append({
                "course": course.get('course_name', 'Unknown'),
                "hours": round(course_hours, 1),
                "focus": "Study and assignments"
            })
    
    return daily_schedule

def generate_weekly_schedule(courses: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate weekly study schedule."""
    weekly_data = []
    
    for course in courses:
        course_hours = sum(chapter.get('weekly_hours', 2) for chapter in course.get('chapters', []))
        weekly_data.append({
            "course_name": course.get('course_name', 'Unknown'),
            "weekly_hours": course_hours,
            "chapters": len(course.get('chapters', [])),
            "assignments": len(course.get('homework', [])),
            "exams": len(course.get('exams', [])),
            "projects": len(course.get('projects', []))
        })
    
    return {
        "total_hours": sum(item["weekly_hours"] for item in weekly_data),
        "courses": weekly_data
    }

def collect_deadlines(courses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Collect and sort all deadlines."""
    deadlines = []
    
    for course in courses:
        course_name = course.get('course_name', 'Unknown')
        
        # Add homework deadlines
        for hw in course.get('homework', []):
            deadlines.append({
                "date": hw.get('due_date', ''),
                "type": "homework",
                "title": hw.get('title', ''),
                "course": course_name,
                "priority": "medium"
            })
        
        # Add exam deadlines
        for exam in course.get('exams', []):
            deadlines.append({
                "date": exam.get('date', ''),
                "type": "exam",
                "title": exam.get('type', ''),
                "course": course_name,
                "priority": "high"
            })
        
        # Add project deadlines
        for project in course.get('projects', []):
            deadlines.append({
                "date": project.get('due_date', ''),
                "type": "project",
                "title": project.get('title', ''),
                "course": course_name,
                "priority": "high"
            })
    
    # Sort by date
    deadlines.sort(key=lambda x: x.get('date', ''))
    return deadlines

def format_schedule_for_frontend(schedule_data: Dict[str, Any]) -> Dict[str, Any]:
    """Format schedule data for frontend consumption."""
    return {
        "summary": {
            "total_courses": len(schedule_data.get('courses', [])),
            "total_weekly_hours": schedule_data.get('total_weekly_hours', 0),
            "total_deadlines": len(schedule_data.get('deadlines', []))
        },
        "daily_schedule": schedule_data.get('daily_schedule', {}),
        "weekly_schedule": schedule_data.get('weekly_schedule', {}),
        "deadlines": schedule_data.get('deadlines', [])
    }

if __name__ == "__main__":
    # Test with sample data
    sample_courses = [
        {
            "course_name": "Test Course 1",
            "chapters": [{"name": "Chapter 1", "weekly_hours": 3}],
            "homework": [{"title": "HW1", "due_date": "2025-01-15"}],
            "exams": [{"type": "Midterm", "date": "2025-02-01"}]
        }
    ]
    
    schedule = estimate_study_schedule(sample_courses)
    print("Sample schedule generated successfully!")