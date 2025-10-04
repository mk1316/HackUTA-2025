#!/usr/bin/env python3
"""
Integrated Example: Text Extraction + Gemini Processing
Demonstrates the complete pipeline from PDF to structured JSON
"""

import os
import json
from main import extract_text
from gemini_processor import analyze_syllabus_text, summarize_study_plan, configure_gemini_api


def process_syllabus_pdf(pdf_path: str, api_key: str = None) -> dict:
    """
    Complete pipeline: Extract text from PDF and analyze with Gemini.
    
    Args:
        pdf_path (str): Path to the PDF file
        api_key (str, optional): Google AI API key
        
    Returns:
        dict: Structured analysis results
    """
    print("🚀 Starting complete syllabus processing pipeline...")
    print("=" * 60)
    
    # Step 1: Extract text from PDF
    print("📄 Step 1: Extracting text from PDF...")
    try:
        extracted_text = extract_text(pdf_path)
        print(f"✅ Extracted {len(extracted_text)} characters")
    except Exception as e:
        print(f"❌ Text extraction failed: {e}")
        return {"error": f"Text extraction failed: {e}"}
    
    # Step 2: Analyze with Gemini
    print("\n🤖 Step 2: Analyzing with Gemini AI...")
    try:
        analysis_result = analyze_syllabus_text(extracted_text, api_key)
        print("✅ Gemini analysis completed")
        return analysis_result
    except Exception as e:
        print(f"❌ Gemini analysis failed: {e}")
        return {"error": f"Gemini analysis failed: {e}"}


def main():
    """Main function to demonstrate the integrated pipeline."""
    print("=" * 60)
    print("INTEGRATED SYLLABUS PROCESSING PIPELINE")
    print("=" * 60)
    
    # Configuration
    pdf_path = "sampleSyllabus/sample2.pdf"
    api_key = os.getenv('GEMINI_API_KEY')
    
    # Check API key
    if not api_key:
        print("⚠️  GEMINI_API_KEY environment variable not set")
        print("Please set your Google AI API key:")
        print("export GEMINI_API_KEY='your-api-key-here'")
        print("")
        print("Get your API key from: https://makersuite.google.com/app/apikey")
        return
    
    # Check if PDF exists
    if not os.path.exists(pdf_path):
        print(f"❌ PDF file not found: {pdf_path}")
        print("Please ensure your test PDF is in the sampleSyllabus directory")
        return
    
    # Process the syllabus
    try:
        result = process_syllabus_pdf(pdf_path, api_key)
        
        if "error" in result:
            print(f"\n❌ Processing failed: {result['error']}")
            return
        
        # Display results
        print("\n📊 RAW JSON RESULT:")
        print(json.dumps(result, indent=2))
        
        print("\n📋 FORMATTED SUMMARY:")
        print(summarize_study_plan(result))
        
        # Save results to file
        output_file = "analysis_result.json"
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"\n💾 Results saved to: {output_file}")
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")


if __name__ == "__main__":
    main()
