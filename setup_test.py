#!/usr/bin/env python3
"""
Setup script to create testing directory structure
"""

import os

def setup_testing():
    """Create the sample_syllabi directory for testing"""
    
    # Create the testing directory
    test_dir = "sampleSyllabus"
    
    if not os.path.exists(test_dir):
        os.makedirs(test_dir)
        print(f"✅ Created directory: {test_dir}")
    else:
        print(f"📁 Directory already exists: {test_dir}")
    
    # Create a placeholder file to show where to put PDFs
    placeholder_file = os.path.join(test_dir, "README.txt")
    with open(placeholder_file, "w") as f:
        f.write("""TESTING DIRECTORY FOR SYLLABUS PDFs
=====================================

Place your test PDF files here with names like:
- syllabus1.pdf
- syllabus2.pdf
- test_syllabus.pdf
- etc.

The main.py script is configured to look for:
- sampleSyllabus/syllabus1.pdf (default test file)

You can also modify the test_pdf variable in main.py to point to any PDF file you want to test.
""")
    
    print(f"📝 Created placeholder file: {placeholder_file}")
    
    print("\n" + "="*50)
    print("TESTING SETUP COMPLETE")
    print("="*50)
    print(f"📁 Put your test PDF files in: {test_dir}/")
    print("📄 Default test file expected: sampleSyllabus/syllabus1.pdf")
    print("🔧 You can modify the test_pdf variable in main.py to test different files")
    print("="*50)

if __name__ == "__main__":
    setup_testing()
