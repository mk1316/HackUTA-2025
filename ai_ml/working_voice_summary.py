#!/usr/bin/env python3
"""
Working Syllabus Voice Summary Generator
Creates humorous combined syllabus summary and MP3 using ElevenLabs
"""

import os
import json
import re
from typing import List, Dict
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

def clean_for_elevenlabs(text: str) -> str:
    """Clean Gemini-generated text for ElevenLabs audio generation."""
    # Remove Markdown bold (**bold**) and italics (*italic*)
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"\*(.*?)\*", r"\1", text)
    return text

def generate_humorous_summary(courses: List[Dict]) -> str:
    """Generate humorous summary using Gemini AI."""
    print("🤖 Generating humorous summary with Gemini AI...")
    
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("⚠️  GEMINI_API_KEY not found - using mock summary")
        return """
        Hello everyone, Macdonald Trunk here — your favorite course mentor.
        
        Welcome to your semester! I've got some exciting courses for you:
        
        📚 MATH-2415 Calculus III with Dr. Sarah Johnson
        Ah yes, everyone's favorite course — math, where numbers haunt our dreams.
        You'll be meeting Mon/Wed/Fri at 10:00 AM. Perfect timing to wake up those brain cells!
        
        💻 CS-3310 Data Structures with Prof. Michael Chen  
        Remember, code never sleeps — but you might want to!
        Tuesday/Thursday at 1:00 PM - when your caffeine levels are still high.
        
        💰 ECON-2301 Principles of Economics with Dr. Emily Rodriguez
        Get ready to analyze supply and demand — mostly your supply of sleep.
        Monday/Wednesday at 11:30 AM - right before lunch, perfect timing!
        
        🧠 PSYC-2301 General Psychology with Dr. James Wilson
        Prepare to psychoanalyze yourself halfway through the semester.
        Monday/Wednesday/Friday at 9:00 AM - early bird gets the psychological insights!
        
        Now go out there and make your professors proud — or at least awake!
        """
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    You are **Macdonald Trunk**, a funny, confident course mentor.  
    Start every message with 'Hello everyone, Macdonald Trunk here — your favorite course mentor.'  
    Summarize all syllabi with humor and motivation.  
    Mention professors, class times, office hours, exams, projects.  
    Never include deadlines or refund info.  
    Add course-specific jokes:
    - Math → 'Ah yes, everyone's favorite course — math, where numbers haunt our dreams.'
    - CS → 'Remember, code never sleeps — but you might want to!'
    - Economics → 'Get ready to analyze supply and demand — mostly your supply of sleep.'
    - Psychology → 'Prepare to psychoanalyze yourself halfway through the semester.'
    - Default → 'You surely don't want to sleep in this class — trust me.'
    End with a motivational line like: 'Now go out there and make your professors proud — or at least awake.
    You are a humorous and energetic course mentor named Macdonald Trunk. 
I have a syllabus summary text that you previously generated. I need you to:

1. Replace all day abbreviations with their full names (e.g., Mon → Monday, Tue → Tuesday, Wed → Wednesday, Thu → Thursday, Fri → Friday).
2. Add a humorous acknowledgement that deadlines exist (for example: "Yes, there are deadlines — so many deadlines my non-existent brain can barely comprehend them!").
3. Keep the text funny, engaging, and in your voice as Macdonald Trunk.
4. Preserve all course details, professor names, class times, office hours, projects, and exams.
5. Avoid removing or changing any other useful course information.

Return the fully corrected, polished text in plain text.

    
    '
    
    Here are the course syllabi to summarize:
    {json.dumps(courses, indent=2)}
    
    Create a humorous, engaging summary that covers all courses with Macdonald Trunk's personality.
    """
    
    try:
        response = model.generate_content(prompt)
        summary = response.text.strip()
        print("✅ Humorous summary generated successfully!")
        return summary
    except Exception as e:
        print(f"❌ Error generating summary: {e}")
        return "Error generating summary"

def generate_mp3_with_elevenlabs(summary: str) -> str:
    """Generate MP3 using ElevenLabs API."""
    print("🎤 Generating MP3 with ElevenLabs...")
    
    # Check API key
    api_key = os.getenv('ELEVENLABS_API_KEY')
    if not api_key:
        print("❌ ELEVENLABS_API_KEY not found - cannot generate MP3")
        return None
    
    try:
        # Import ElevenLabs with error handling
        try:
            from elevenlabs import generate, save, set_api_key
        except ImportError:
            print("❌ ElevenLabs not installed. Installing...")
            os.system("pip install elevenlabs")
            from elevenlabs import generate, save, set_api_key
        
        # Set the API key for ElevenLabs
        set_api_key(api_key)
        print(f"✅ ElevenLabs API key set: {api_key[:10]}...")
        
        # Ensure output directory exists
        output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)
        
        # Clean text for ElevenLabs
        cleaned_summary = clean_for_elevenlabs(summary)
        print("🧹 Text cleaned for ElevenLabs audio generation")
        
        # Generate audio
        print("🎵 Generating audio with ElevenLabs...")
        audio = generate(
            text=cleaned_summary,
            voice="l1HnyxS1XlopzjxxWRnm",  # Your custom voice ID
            model="eleven_monolingual_v1"
        )
        
        # Save to file
        output_path = os.path.join(output_dir, "macdonald_summary.mp3")
        save(audio, output_path)
        
        print(f"✅ MP3 saved to: {output_path}")
        return output_path
        
    except Exception as e:
        print(f"❌ Error generating MP3: {e}")
        print("❌ Voice generation failed - no output file created")
        return None

def load_sample_courses() -> List[Dict]:
    """Load sample course data."""
    return [
        {
            "course_name": "MATH-2415 Calculus III",
            "professor": {
                "name": "Dr. Sarah Johnson",
                "email": "sarah.johnson@uta.edu",
                "office_hours": "Tue/Thu 2:00-4:00 PM"
            },
            "class_schedule": "Mon/Wed/Fri 10:00-11:15 AM",
            "chapters": [
                {"name": "Vectors and Vector-Valued Functions", "suggested_order": 1, "weekly_hours": 4},
                {"name": "Partial Differentiation", "suggested_order": 2, "weekly_hours": 3}
            ],
            "exams": [
                {"type": "Midterm 1", "date": "2025-10-15"},
                {"type": "Final Exam", "date": "2025-12-10"}
            ],
            "projects": [
                {"title": "Vector Analysis Project", "due_date": "2025-11-20"}
            ]
        },
        {
            "course_name": "CS-3310 Data Structures",
            "professor": {
                "name": "Prof. Michael Chen",
                "email": "michael.chen@uta.edu",
                "office_hours": "Mon/Wed 3:00-5:00 PM"
            },
            "class_schedule": "Tue/Thu 1:00-2:30 PM",
            "chapters": [
                {"name": "Arrays and Linked Lists", "suggested_order": 1, "weekly_hours": 5},
                {"name": "Trees and Graphs", "suggested_order": 2, "weekly_hours": 6}
            ],
            "exams": [
                {"type": "Quiz 1", "date": "2025-09-25"},
                {"type": "Midterm", "date": "2025-10-30"}
            ],
            "projects": [
                {"title": "Binary Search Tree Implementation", "due_date": "2025-11-15"}
            ]
        },
        {
            "course_name": "ECON-2301 Principles of Economics",
            "professor": {
                "name": "Dr. Emily Rodriguez",
                "email": "emily.rodriguez@uta.edu",
                "office_hours": "Wed/Fri 1:00-3:00 PM"
            },
            "class_schedule": "Mon/Wed 11:30 AM-12:45 PM",
            "chapters": [
                {"name": "Supply and Demand", "suggested_order": 1, "weekly_hours": 3},
                {"name": "Market Structures", "suggested_order": 2, "weekly_hours": 4}
            ],
            "exams": [
                {"type": "Midterm 1", "date": "2025-10-08"},
                {"type": "Final Exam", "date": "2025-12-12"}
            ],
            "projects": [
                {"title": "Economic Analysis Paper", "due_date": "2025-11-25"}
            ]
        },
        {
            "course_name": "PSYC-2301 General Psychology",
            "professor": {
                "name": "Dr. James Wilson",
                "email": "james.wilson@uta.edu",
                "office_hours": "Tue/Thu 10:00 AM-12:00 PM"
            },
            "class_schedule": "Mon/Wed/Fri 9:00-9:50 AM",
            "chapters": [
                {"name": "Introduction to Psychology", "suggested_order": 1, "weekly_hours": 2},
                {"name": "Research Methods", "suggested_order": 2, "weekly_hours": 3}
            ],
            "exams": [
                {"type": "Quiz 1", "date": "2025-09-20"},
                {"type": "Midterm", "date": "2025-10-25"}
            ],
            "projects": [
                {"title": "Psychology Experiment Report", "due_date": "2025-11-30"}
            ]
        }
    ]

def main():
    """Main function to generate humorous voice summary."""
    print("🎭 MACDONALD TRUNK'S SYLLABUS VOICE SUMMARY")
    print("=" * 60)
    
    try:
        # Load sample courses
        print("📚 Loading sample course data...")
        courses = load_sample_courses()
        print(f"✅ Loaded {len(courses)} courses")
        
        # Generate humorous summary
        print("\n🤖 Generating humorous summary...")
        summary = generate_humorous_summary(courses)
        
        # Summary generated (no display)
        print("✅ Humorous summary generated successfully!")
        
        # Generate MP3
        print("\n🎤 Generating voice summary...")
        output_path = generate_mp3_with_elevenlabs(summary)
        
        # Final output
        if output_path:
            print(f"\n🎉 SUCCESS!")
            print(f"🎵 MP3 file created: {output_path}")
        else:
            print(f"\n❌ FAILED!")
            print(f"🎵 No MP3 file created")
        
        return summary, output_path
        
    except Exception as e:
        print(f"❌ Error in main process: {e}")
        raise

if __name__ == "__main__":
    main()
