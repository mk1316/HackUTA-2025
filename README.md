# Syllabus Text Extraction & AI Processing Module

A comprehensive Python module for extracting text from PDF syllabi and processing it with Google Gemini AI to produce structured JSON output.

## Features

- **Primary extraction**: Uses `pdfplumber` for fast text extraction from text-based PDFs
- **OCR fallback**: Automatically falls back to OCR using `pytesseract` if text extraction is insufficient
- **AI Processing**: Google Gemini AI analysis to extract structured information (subjects, topics, deadlines)
- **JSON Output**: Produces clean, structured JSON with study plans and deadlines
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

3. Set up Google AI API key:
   - Get API key from: https://makersuite.google.com/app/apikey
   - Set environment variable: `export GEMINI_API_KEY='your-api-key-here'`

## Usage

### Basic Text Extraction
```python
from main import extract_text

# Extract text from a PDF
text = extract_text("path/to/syllabus.pdf")
print(text)
```

### Complete AI Processing Pipeline
```python
from main import extract_text
from gemini_processor import analyze_syllabus_text, summarize_study_plan

# Extract text and analyze with AI
text = extract_text("path/to/syllabus.pdf")
analysis = analyze_syllabus_text(text)
print(summarize_study_plan(analysis))
```

### Integrated Example
```python
# Run the complete pipeline
python integrated_example.py
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
