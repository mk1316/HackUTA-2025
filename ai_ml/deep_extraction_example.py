#!/usr/bin/env python3
"""
Deep Syllabus Extraction Example
Demonstrates comprehensive syllabus parsing with detailed information extraction
"""

import os
import json
from main import extract_text
from gemini_extractor import extract_syllabus_info, summarize_extraction, validate_extraction_data


def process_syllabus_deep(pdf_path: str, api_key: str = None) -> dict:
    """
    Complete pipeline: Extract text from PDF and perform deep analysis with Gemini.
    
    Args:
        pdf_path (str): Path to the PDF file
        api_key (str, optional): Google AI API key
        
    Returns:
        dict: Comprehensive analysis results
    """
    print("🚀 Starting deep syllabus processing pipeline...")
    print("=" * 80)
    
    # Step 1: Extract text from PDF
    print("📄 Step 1: Extracting text from PDF...")
    try:
        extracted_text = extract_text(pdf_path)
        print(f"✅ Extracted {len(extracted_text)} characters")
    except Exception as e:
        print(f"❌ Text extraction failed: {e}")
        return {"error": f"Text extraction failed: {e}"}
    
    # Step 2: Deep analysis with Gemini
    print("\n🤖 Step 2: Performing deep syllabus analysis...")
    try:
        analysis_result = extract_syllabus_info(extracted_text, api_key)
        print("✅ Deep analysis completed")
        return analysis_result
    except Exception as e:
        print(f"❌ Deep analysis failed: {e}")
        return {"error": f"Deep analysis failed: {e}"}


def main():
    """Main function to demonstrate the deep extraction pipeline."""
    print("=" * 80)
    print("DEEP SYLLABUS EXTRACTION PIPELINE")
    print("=" * 80)
    
    # Configuration
    pdf_path = "sampleSyllabus/sample2.pdf"  # Using sample2.pdf
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
        result = process_syllabus_deep(pdf_path, api_key)
        
        if "error" in result:
            print(f"\n❌ Processing failed: {result['error']}")
            return
        
        # Display results
        print("\n📊 RAW JSON RESULT:")
        print(json.dumps(result, indent=2))
        
        print("\n📋 COMPREHENSIVE SUMMARY:")
        print(summarize_extraction(result))
        
        # Validate the data
        if validate_extraction_data(result):
            print("\n✅ Data structure validation passed!")
        else:
            print("\n⚠️  Data structure validation failed!")
        
        # Save results to file
        output_file = "deep_analysis_result.json"
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"\n💾 Results saved to: {output_file}")
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")


if __name__ == "__main__":
    main()

