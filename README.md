# SyllabusSync 📚🎓

AI-powered syllabus processing and calendar integration platform that transforms your course syllabi into organized, actionable schedules with voice summaries.

## 🌟 Features

- **📄 PDF Syllabus Upload** - Upload course syllabi in PDF format
- **🤖 AI-Powered Extraction** - Gemini 2.0 Flash automatically extracts assignments, exams, and projects
- **📅 Calendar Integration** - Export events to .ics format (compatible with Google Calendar, Apple Calendar, Outlook)
- **🎤 Voice Summaries** - Get humorous AI-generated voice summaries of your syllabus with ElevenLabs
- **📊 Multiple Views** - Calendar view, Kanban board, and list view for your assignments
- **🌓 Dark/Light Mode** - Theme toggle for comfortable viewing
- **🔐 Authentication** - Secure login with Auth0
- **☁️ Cloud Storage** - Firebase Firestore for data persistence

## 🏗️ Architecture

```
SyllabusSync/
├── frontend/          # Next.js 15.5.4 (React, TypeScript, Tailwind CSS)
├── backend/           # FastAPI (Python 3.13)
├── ai_ml/             # AI/ML Service (Gemini, ElevenLabs)
└── docs/              # Documentation
```

### Tech Stack

**Frontend:**
- Next.js 15.5.4 with Turbopack
- React 19
- TypeScript
- Tailwind CSS
- FullCalendar for calendar views
- Lucide React for icons

**Backend:**
- FastAPI
- Python 3.13
- Firebase Admin SDK
- Auth0 for authentication
- CORS middleware

**AI/ML Service:**
- Google Gemini 2.0 Flash Exp (document understanding)
- ElevenLabs (voice synthesis)
- Python 3.13

**Database:**
- Firebase Firestore

**Authentication:**
- Auth0 (JWT tokens)

## 🚀 Getting Started

### Prerequisites

- **Python 3.13+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** or **yarn**
- **Git**

### Required API Keys

You'll need to obtain the following API keys:

1. **Google Gemini API Key** - [Get it here](https://makersuite.google.com/app/apikey)
2. **ElevenLabs API Key** - [Get it here](https://elevenlabs.io/)
3. **Firebase Project** - [Create project](https://console.firebase.google.com/)
4. **Auth0 Account** - [Sign up](https://auth0.com/)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mk1316/HackUTA-2025.git
cd HackUTA-2025
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your credentials:
# - Firebase credentials (from Firebase Console > Project Settings > Service Accounts)
# - Auth0 domain and audience
# - Frontend origin URL
```

**Backend `.env` Configuration:**

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://syllabus-sync-api

# Service URLs
AI_ML_URL=http://localhost:5050
FRONTEND_ORIGIN=http://localhost:3000
```

### 3. AI/ML Service Setup

```bash
# Navigate to ai_ml directory
cd ../ai_ml

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# venv\Scripts\activate   # On Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your API keys
```

**AI/ML `.env` Configuration:**

```env
# Google Gemini API Key
GEMINI_API_KEY=your-gemini-api-key-here

# ElevenLabs API Key
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local and add your configuration
```

**Frontend `.env.local` Configuration:**

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Auth0 Configuration (Frontend)
NEXT_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-frontend-client-id
NEXT_PUBLIC_AUTH0_AUDIENCE=https://syllabus-sync-api

# AI/ML Service (optional, usually accessed through backend)
NEXT_PUBLIC_AI_ML_URL=http://localhost:5050
```

## 🎯 Running the Application

You need to run all three services simultaneously. Open **3 separate terminal windows**:

### Terminal 1: Backend Service

```bash
cd backend
source venv/bin/activate  # Activate virtual environment
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: **http://localhost:8000**
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### Terminal 2: AI/ML Service

```bash
cd ai_ml
source venv/bin/activate  # Activate virtual environment
python api.py
```

AI/ML service will be available at: **http://localhost:5050**
- Health Check: http://localhost:5050/health

### Terminal 3: Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at: **http://localhost:3000**

## 🔧 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in production mode"
   - Select a location
4. Get Service Account credentials:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file
   - Copy the values to your backend `.env` file

## 🔐 Auth0 Setup

### Backend API Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new application:
   - Type: **API**
   - Name: "SyllabusSync Backend API"
3. Copy the **Domain** and **Audience** to backend `.env`

### Frontend Application

1. Create another application:
   - Type: **Single Page Application**
   - Name: "SyllabusSync Frontend"
2. Configure settings:
   - Allowed Callback URLs: `http://localhost:3000/callback`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`
3. Copy **Domain** and **Client ID** to frontend `.env.local`

## 📖 Usage

### 1. Upload a Syllabus

1. Navigate to http://localhost:3000
2. Click "Upload Syllabus" or drag & drop a PDF file
3. Click "Process Syllabus"
4. Wait for AI to extract information (~30-60 seconds)

### 2. Review Parsed Events

- View all extracted assignments, exams, and projects
- Edit event details (title, date, description)
- Add new events manually
- Delete unwanted events

### 3. Export to Calendar

Click "Export to Calendar" to download an `.ics` file that can be imported into:
- Google Calendar
- Apple Calendar
- Microsoft Outlook
- Any calendar app that supports .ics format

### 4. Generate Voice Summary

1. Click "Voice Summary" button
2. Wait for AI to generate humorous summary (~20-30 seconds)
3. Listen to Macdonald Trunk's voice summary
4. Audio plays automatically in your browser

### 5. View in Calendar

Navigate to `/calendar` to see your events in a calendar view with:
- Month/Week/Day views
- Color-coded event types
- Click events for details

### 6. Manage with Kanban Board

Navigate to `/kanban` to organize tasks with:
- Drag-and-drop functionality
- Status columns (To Do, In Progress, Done)
- Task filtering and sorting

## 🐛 Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'firebase_admin'`
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Problem:** Firebase connection errors
- Check that your `.env` file has correct Firebase credentials
- Ensure `FIREBASE_PRIVATE_KEY` has proper line breaks (`\n`)

### AI/ML Service Issues

**Problem:** `GEMINI_API_KEY not configured`
- Check that `ai_ml/.env` has your Gemini API key
- Verify the key is valid at https://makersuite.google.com/app/apikey

**Problem:** ElevenLabs voice generation fails
- Verify `ELEVENLABS_API_KEY` in `ai_ml/.env`
- Check your ElevenLabs account has available credits

### Frontend Issues

**Problem:** `useTheme is not defined`
```bash
cd frontend
npm install
# Restart the dev server
```

**Problem:** CORS errors
- Ensure backend is running on port 8000
- Check `FRONTEND_ORIGIN` in backend `.env` matches your frontend URL

**Problem:** Audio doesn't play
- Check browser console for errors
- Allow audio autoplay in browser settings
- Try clicking the Voice Summary button again (browsers allow audio after user interaction)

## 🧪 Testing

### Test Backend

```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy","timestamp":"...","version":"1.0.0"}
```

### Test AI/ML Service

```bash
curl http://localhost:5050/health
# Expected: {"status":"healthy","gemini_configured":true}
```

### Test Frontend

Open http://localhost:3000 in your browser - you should see the landing page.

## 📁 Project Structure

```
HackUTA-2025/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── routers/
│   │   ├── upload.py          # Syllabus upload endpoints
│   │   ├── calendar.py        # Calendar integration
│   │   └── auth.py            # Authentication endpoints
│   ├── services/
│   │   ├── ai_service.py      # AI/ML service client
│   │   └── calendar_service.py
│   ├── db/
│   │   └── database.py        # Firebase Firestore setup
│   ├── utils/
│   │   └── auth0_utils.py     # Auth0 JWT verification
│   ├── requirements.txt
│   └── .env.example
│
├── ai_ml/
│   ├── api.py                 # FastAPI wrapper for AI services
│   ├── text_extraction.py     # PDF text extraction
│   ├── working_voice_summary.py # Voice summary generation
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Main landing page
│   │   ├── layout.tsx         # Root layout with theme
│   │   ├── calendar/
│   │   │   └── page.tsx       # Calendar view
│   │   ├── kanban/
│   │   │   └── page.tsx       # Kanban board
│   │   ├── components/
│   │   │   ├── FileUpload.tsx
│   │   │   ├── ParsedEventsModal.tsx
│   │   │   ├── CalendarView.tsx
│   │   │   ├── KanbanBoard.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx
│   │   ├── lib/
│   │   │   └── api.ts         # API client
│   │   └── utils/
│   │       ├── api.ts         # API utilities
│   │       └── calendar.ts    # Calendar export
│   ├── package.json
│   └── .env.local.example
│
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔒 Security Notes

- Never commit `.env` files to version control
- Keep API keys secure and rotate them regularly
- Use environment variables for all sensitive data
- Enable Auth0 authentication in production
- Use HTTPS in production environments

## 📄 License

This project was created for HackUTA 2025.

## 👥 Team

Built with ❤️ by the SyllabusSync team at HackUTA 2025

## 🙏 Acknowledgments

- Google Gemini for AI-powered document understanding
- ElevenLabs for voice synthesis
- Firebase for cloud infrastructure
- Auth0 for authentication
- Next.js and FastAPI communities

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation in `/docs`
- Review API documentation at `/docs` endpoint

---

**Happy Syllabus Syncing! 🎓✨**
