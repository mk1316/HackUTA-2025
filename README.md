# Syllabus Text Extraction Module

A Python module for extracting text from PDF syllabi using `pdfplumber` with OCR fallback.

## Features

- **Primary extraction**: Uses `pdfplumber` for fast text extraction from text-based PDFs
- **OCR fallback**: Automatically falls back to OCR using `pytesseract` if text extraction is insufficient
- **Robust error handling**: Handles various PDF formats and edge cases
- **Detailed logging**: Comprehensive logging for debugging during hackathon development
- **Statistics**: Provides extraction statistics and validation

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install system dependencies for OCR:
   - **macOS**: `brew install tesseract`
   - **Ubuntu/Debian**: `sudo apt-get install tesseract-ocr`
   - **Windows**: Download from [GitHub releases](https://github.com/UB-Mannheim/tesseract/wiki)

## Usage

```python
from main import extract_text

# Extract text from a PDF
text = extract_text("path/to/syllabus.pdf")
print(text)
```

## Testing

Run the module directly to test with a sample PDF:

```bash
python main.py
```

Make sure to place test PDFs in a `sample_syllabi/` directory or modify the test path in the code.

## Requirements

- Python 3.7+
- pdfplumber
- pdf2image
- pytesseract
- Pillow
- tesseract-ocr (system dependency)
