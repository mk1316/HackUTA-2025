#!/usr/bin/env python3
"""
Manual MP3 Generator - Alternative approach using system TTS
"""

import os
import subprocess
import sys

def generate_mp3_with_system_tts(text: str) -> str:
    """Generate MP3 using system text-to-speech."""
    print("🎤 Generating MP3 using system TTS...")
    
    # Ensure output directory exists
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, "macdonald_summary.mp3")
    
    try:
        # Try macOS say command first
        if sys.platform == "darwin":  # macOS
            print("🍎 Using macOS 'say' command...")
            subprocess.run([
                "say", "-v", "Alex", "-r", "180", "-o", output_path, text
            ], check=True)
            print(f"✅ MP3 generated with macOS TTS: {output_path}")
            return output_path
            
    except subprocess.CalledProcessError as e:
        print(f"❌ macOS TTS failed: {e}")
    
    try:
        # Try espeak if available
        print("🔊 Trying espeak...")
        subprocess.run([
            "espeak", "-s", "180", "-v", "en", "-w", output_path, text
        ], check=True)
        print(f"✅ MP3 generated with espeak: {output_path}")
        return output_path
        
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ espeak not available")
    
    # Fallback: Create text file
    print("💾 Fallback: Creating text file...")
    txt_path = os.path.join(output_dir, "macdonald_summary.txt")
    with open(txt_path, 'w') as f:
        f.write(text)
    print(f"📄 Text file created: {txt_path}")
    return txt_path

def main():
    """Test manual MP3 generation."""
    print("🎭 MANUAL MP3 GENERATOR TEST")
    print("=" * 50)
    
    # Sample Macdonald Trunk text
    sample_text = """
    Hello everyone, Macdonald Trunk here — your favorite course mentor.
    
    Welcome to your semester! I've got some exciting courses for you:
    
    MATH-2415 Calculus III with Dr. Sarah Johnson
    Ah yes, everyone's favorite course — math, where numbers haunt our dreams.
    You'll be meeting Mon/Wed/Fri at 10:00 AM. Perfect timing to wake up those brain cells!
    
    CS-3310 Data Structures with Prof. Michael Chen  
    Remember, code never sleeps — but you might want to!
    Tuesday/Thursday at 1:00 PM - when your caffeine levels are still high.
    
    ECON-2301 Principles of Economics with Dr. Emily Rodriguez
    Get ready to analyze supply and demand — mostly your supply of sleep.
    Monday/Wednesday at 11:30 AM - right before lunch, perfect timing!
    
    PSYC-2301 General Psychology with Dr. James Wilson
    Prepare to psychoanalyze yourself halfway through the semester.
    Monday/Wednesday/Friday at 9:00 AM - early bird gets the psychological insights!
    
    Now go out there and make your professors proud — or at least awake!
    """
    
    print("📝 Sample text:")
    print("-" * 30)
    print(sample_text)
    print("-" * 30)
    
    # Generate MP3
    output_path = generate_mp3_with_system_tts(sample_text)
    
    print(f"\n🎉 RESULT:")
    print(f"📁 Output: {output_path}")
    
    if output_path.endswith('.mp3'):
        print("🎵 MP3 file created successfully!")
    else:
        print("📄 Text file created (MP3 generation not available)")

if __name__ == "__main__":
    main()
