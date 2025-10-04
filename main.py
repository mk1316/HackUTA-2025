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
except ImportError as e:
    logger.error(f"Missing required library: {e}")
    logger.error("Please install required packages:")
    logger.error("pip install pdfplumber pdf2image pytesseract Pillow")
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
    test_pdf = "sampleSyllabus/sample1.pdf"
    
    print("=" * 60)
    print("SYLLABUS TEXT EXTRACTION MODULE")
    print("=" * 60)
    
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
            
            print("\n📝 EXTRACTED TEXT PREVIEW (first 500 characters):")
            print("-" * 60)
            print(extracted_text[:500])
            if len(extracted_text) > 500:
                print("...")
                print(f"[Text truncated - showing first 500 of {len(extracted_text)} characters]")
            print("-" * 60)
            
            if stats['is_empty']:
                print("⚠️  WARNING: No text was extracted!")
            else:
                print("✅ Text extraction completed successfully!")
                
    except FileNotFoundError as e:
        print(f"❌ File not found: {e}")
    except Exception as e:
        print(f"❌ Error during extraction: {e}")
        logger.exception("Full error details:")
    
    print("\n" + "=" * 60)
    print("REQUIRED PACKAGES:")
    print("pip install pdfplumber pdf2image pytesseract Pillow")
    print("=" * 60)
