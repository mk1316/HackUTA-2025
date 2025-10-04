# AI/ML Syllabus Parser

A comprehensive AI-powered syllabus parsing system with intelligent study scheduling and optimization.

## 🚀 Features

- **PDF Text Extraction**: Robust PDF processing with OCR fallback
- **AI-Powered Analysis**: Gemini AI for deep syllabus understanding
- **Intelligent Optimization**: Chapter reordering and study time estimation
- **Study Scheduling**: Combined daily/weekly schedules from multiple courses
- **RESTful API**: FastAPI endpoints for easy frontend integration
- **CORS Support**: Ready for frontend integration

## 📁 Project Structure

```
HACKUTA/NLP/ai_ml/
├── main.py                 # FastAPI application with endpoints
├── text_extraction.py      # PDF processing and text extraction
├── study_estimator.py      # Study scheduling and time estimation
├── gemini_teacher.py       # AI optimization and recommendations
├── requirements.txt       # Python dependencies
├── sample_syllabi/        # Test PDF files
│   ├── sample1.pdf
│   └── sample2.pdf
└── helpers/               # (Empty - ready for future modules)
```

## 🛠 Installation

### 1. Install Python Dependencies
```bash
cd ai_ml
pip install -r requirements.txt
```

### 2. Install System Dependencies
- **macOS**: `brew install tesseract`
- **Ubuntu/Debian**: `sudo apt-get install tesseract-ocr`
- **Windows**: Download from [GitHub releases](https://github.com/UB-Mannheim/tesseract/wiki)

### 3. Set Up API Key (Optional)
```bash
export GEMINI_API_KEY='your-api-key-here'
```
Get your API key from: https://makersuite.google.com/app/apikey

## 🚀 Usage

### Start the API Server
```bash
cd ai_ml
python main.py
```
The API will be available at `http://localhost:8000`

### API Endpoints

#### 1. Health Check
```bash
GET /
GET /health
```

#### 2. Parse Syllabus
```bash
POST /parse
```
- **Files**: Upload one or more PDF files
- **Parameters**: `optimize=true/false` (AI optimization)
- **Returns**: Structured course data

#### 3. Generate Study Schedule
```bash
POST /estimate
```
- **Files**: Upload multiple PDF files
- **Parameters**: `optimize=true/false` (AI optimization)
- **Returns**: Combined study schedule

#### 4. Sample Courses
```bash
GET /courses/sample
```

#### 5. Test Sample Parse
```bash
POST /test/parse-sample
```

## 🧪 Testing

### Example API Calls

#### Parse Single Course
```python
import requests

files = [('files', ('syllabus.pdf', open('syllabus.pdf', 'rb'), 'application/pdf'))]
response = requests.post('http://localhost:8000/parse', files=files)
print(response.json())
```

#### Generate Study Schedule
```python
import requests

files = [
    ('files', ('course1.pdf', open('course1.pdf', 'rb'), 'application/pdf')),
    ('files', ('course2.pdf', open('course2.pdf', 'rb'), 'application/pdf'))
]
response = requests.post('http://localhost:8000/estimate', files=files, params={'optimize': True})
print(response.json())
```

## 🤖 AI Features

### Optimization Mode
When `optimize=true`:
- **Chapter Reordering**: Intelligent learning sequence
- **Study Time Estimation**: AI-generated weekly hours
- **Difficulty Assessment**: Beginner/Intermediate/Advanced
- **Study Recommendations**: Personalized advice

### Without Optimization
- **Basic Extraction**: Standard syllabus parsing
- **Manual Scheduling**: Simple time distribution
- **No AI Processing**: Faster, no API key required

## 🚀 Ready for Hackathon Demo

The project is now clean, organized, and fully functional with:
- **FastAPI endpoints** (`/parse`, `/estimate`)
- **AI-powered optimization** (Gemini integration)
- **Study scheduling** (multiple course support)
- **Frontend-ready JSON** (CORS enabled)
- **Demo PDFs** (sample1.pdf, sample2.pdf)