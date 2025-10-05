# AI/ML Syllabus Parser

A comprehensive AI-powered syllabus parsing system with intelligent study scheduling and optimization.

## 🚀 Features

- **PDF Text Extraction**: Robust PDF processing with OCR fallback
- **AI-Powered Analysis**: Gemini AI for deep syllabus understanding
- **Intelligent Optimization**: Chapter reordering and study time estimation
- **Study Scheduling**: Combined daily/weekly schedules from multiple courses
- **Voice Summaries**: Humorous audio summaries with ElevenLabs voice synthesis
- **RESTful API**: FastAPI endpoints for easy frontend integration
- **CORS Support**: Ready for frontend integration

## 📁 Project Structure

```
HACKUTA/NLP/ai_ml/
├── main.py                      # FastAPI application with endpoints
├── text_extraction.py           # PDF processing and text extraction
├── study_estimator.py           # Study scheduling and time estimation
├── gemini_teacher.py            # AI optimization and recommendations
├── working_voice_summary.py     # Voice summary generation with ElevenLabs
├── manual_mp3_generator.py      # Alternative MP3 generation script
├── api.py                       # Additional API endpoints
├── requirements.txt             # Python dependencies
├── .env                        # API keys (create this file)
├── venv/                       # Virtual environment (created during setup)
├── output/                     # Generated files
│   ├── macdonald_summary.txt    # Text summary output
│   └── macdonald_summary.mp3    # Audio summary output
└── sample_syllabi/             # Test PDF files
    ├── sample1.pdf
    └── sample2.pdf
```

## 🛠 Installation

### 1. Create Virtual Environment
```bash
cd ai_ml
python3.12 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Install System Dependencies
- **macOS**: `brew install tesseract`
- **Ubuntu/Debian**: `sudo apt-get install tesseract-ocr python3-venv`
- **Windows**: Download from [GitHub releases](https://github.com/UB-Mannheim/tesseract/wiki)

### 4. Set Up API Keys
Create a `.env` file in the `ai_ml` directory:
```bash
echo "GEMINI_API_KEY=your-gemini-api-key-here" > .env
echo "ELEVENLABS_API_KEY=your-elevenlabs-api-key-here" >> .env
```

Get your API keys from:
- **Gemini**: https://makersuite.google.com/app/apikey
- **ElevenLabs**: https://elevenlabs.io/app/settings/api-keys

## 🚀 Usage

### Voice Summary Generation
Generate humorous voice summaries of course syllabi:
```bash
cd ai_ml
source venv/bin/activate  # Activate virtual environment
python working_voice_summary.py
```

This will create:
- `output/macdonald_summary.txt` - Text version of the humorous summary
- `output/macdonald_summary.mp3` - Audio version with voice synthesis

### Start the API Server
```bash
cd ai_ml
source venv/bin/activate  # Activate virtual environment
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

## 🔧 Troubleshooting

### ElevenLabs Import Issues
If you encounter import errors with ElevenLabs, the project uses a compatible version:
```bash
pip uninstall elevenlabs -y
pip install elevenlabs==0.2.26
```

### Virtual Environment Issues
If `python3.12 -m venv` fails, install the required package:
```bash
# Ubuntu/Debian
sudo apt install python3.12-venv

# macOS (if using Homebrew)
brew install python@3.12
```

### API Key Issues
Ensure your `.env` file is in the `ai_ml` directory and contains:
```
GEMINI_API_KEY=your_actual_key_here
ELEVENLABS_API_KEY=your_actual_key_here
```

## 🚀 Ready for Hackathon Demo

The project is now clean, organized, and fully functional with:
- **FastAPI endpoints** (`/parse`, `/estimate`)
- **AI-powered optimization** (Gemini integration)
- **Study scheduling** (multiple course support)
- **Voice summaries** (ElevenLabs integration)
- **Frontend-ready JSON** (CORS enabled)
- **Demo PDFs** (sample1.pdf, sample2.pdf)