# HACKUTA NLP Project

AI-powered syllabus parsing system with intelligent study scheduling and optimization.

## 📁 Project Structure

```
HACKUTA/NLP/
└── ai_ml/                    # Main AI/ML application
    ├── main.py               # FastAPI application
    ├── text_extraction.py    # PDF processing and text extraction
    ├── study_estimator.py    # Study scheduling and time estimation
    ├── gemini_teacher.py     # AI optimization and recommendations
    ├── requirements.txt      # Python dependencies
    ├── README.md             # Detailed documentation
    ├── helpers/              # Helper modules (empty)
    └── sample_syllabi/       # Test PDF files
        ├── sample1.pdf
        └── sample2.pdf
```

## 🚀 Quick Start

1. **Navigate to the AI/ML directory:**
   ```bash
   cd ai_ml
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install system dependencies:**
   ```bash
   # macOS
   brew install tesseract
   
   # Ubuntu/Debian
   sudo apt-get install tesseract-ocr
   ```

4. **Set up API key (optional):**
   ```bash
   export GEMINI_API_KEY='your-api-key-here'
   ```

5. **Run the application:**
   ```bash
   python main.py
   ```

## 🌐 API Endpoints

- `GET /` - Health check
- `GET /health` - System status
- `POST /parse` - Extract JSON from PDFs
- `POST /estimate` - Generate study schedule
- `GET /courses/sample` - Sample course information
- `POST /test/parse-sample` - Test with sample PDFs

## 📚 Features

- **PDF Text Extraction**: Robust processing with OCR fallback
- **AI-Powered Analysis**: Gemini AI for deep syllabus understanding
- **Intelligent Optimization**: Chapter reordering and study time estimation
- **Study Scheduling**: Combined daily/weekly schedules from multiple courses
- **RESTful API**: FastAPI endpoints for easy frontend integration
- **CORS Support**: Ready for frontend integration

## 🧪 Testing

The project includes comprehensive testing capabilities:
- Multi-PDF processing (2-4+ PDFs)
- AI optimization features
- Frontend-ready JSON output
- Error handling and logging

## 📖 Documentation

For detailed documentation, see `ai_ml/README.md`.

## 🎯 Hackathon Ready

This project is fully functional and ready for hackathon demonstration with:
- Complete AI/ML pipeline
- FastAPI backend
- Multi-PDF support
- Frontend integration capabilities