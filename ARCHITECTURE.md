# 🏗️ SyllabusSync Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                     http://localhost:3000                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • React Components (Upload, Calendar, Kanban)           │  │
│  │  • API Service Layer (app/lib/api.ts)                    │  │
│  │  • State Management                                      │  │
│  │  • PDF Preview                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         Port: 3000                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ POST /upload
                             │ GET /upload/history
                             │ POST /calendar/sync
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Routers:                                                │  │
│  │  • /upload    - File upload & processing                 │  │
│  │  • /calendar  - Google Calendar integration              │  │
│  │  • /auth      - Auth0 authentication                     │  │
│  │                                                           │  │
│  │  Services:                                               │  │
│  │  • ai_service.py      - Communicate with AI/ML           │  │
│  │  • calendar_service.py - Google Calendar API             │  │
│  │                                                           │  │
│  │  Database:                                               │  │
│  │  • Firebase Firestore - Store syllabi & user data       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         Port: 8000                              │
└────────────────┬───────────────────────────┬────────────────────┘
                 │                           │
                 │ POST /extract             │ Firebase Admin SDK
                 ▼                           ▼
┌────────────────────────────────┐  ┌──────────────────────────┐
│   AI/ML SERVICE (FastAPI)      │  │   FIREBASE FIRESTORE     │
│  ┌──────────────────────────┐  │  │  ┌────────────────────┐  │
│  │  • PDF Text Extraction   │  │  │  │  Collections:      │  │
│  │    - pdfplumber          │  │  │  │  • syllabi         │  │
│  │    - OCR (pytesseract)   │  │  │  │  • users           │  │
│  │                          │  │  │  │  • events          │  │
│  │  • Gemini AI Analysis    │  │  │  └────────────────────┘  │
│  │    - Extract course info │  │  │                          │
│  │    - Parse assignments   │  │  │    (Cloud Database)      │
│  │    - Identify dates      │  │  └──────────────────────────┘
│  │    - Structure data      │  │
│  └──────────────────────────┘  │
│         Port: 5050             │
└────────────────┬───────────────┘
                 │
                 │ Gemini API
                 ▼
┌────────────────────────────────┐
│   GOOGLE GEMINI API            │
│   (AI Text Analysis)           │
└────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.4 (React 19)
- **Styling**: Tailwind CSS 4
- **UI Components**: 
  - FullCalendar (calendar view)
  - dnd-kit (drag & drop kanban)
  - lucide-react (icons)
  - react-pdf (PDF preview)
- **State**: React hooks (useState, useEffect)
- **API Client**: Fetch API

### Backend
- **Framework**: FastAPI 0.115.2
- **Server**: Uvicorn 0.30.6
- **Database**: Firebase Firestore (firebase-admin 6.5.0)
- **Auth**: Auth0 (JWT via python-jose 3.3.0)
- **HTTP Client**: httpx 0.27.2, requests 2.32.3
- **Calendar**: Google Calendar API
- **Logging**: loguru 0.7.2

### AI/ML Service
- **Framework**: FastAPI 0.115.2
- **PDF Processing**: 
  - pdfplumber 0.11.4 (text extraction)
  - pdf2image 1.17.0 (PDF to images)
  - pytesseract 0.3.13 (OCR)
- **AI**: Google Generative AI (Gemini 2.5 Flash)
- **Image**: Pillow 11.0.0

## Data Flow Diagram

```
┌──────────┐
│   User   │
│  Uploads │
│   PDF    │
└────┬─────┘
     │
     ▼
┌────────────────────────────────────────────────────────────┐
│ 1. Frontend validates file & sends to backend              │
└────┬───────────────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────────────────┐
│ 2. Backend receives file, forwards to AI/ML service        │
└────┬───────────────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────────────────┐
│ 3. AI/ML extracts text from PDF                            │
│    - Try pdfplumber first (fast)                           │
│    - Fallback to OCR if needed (slower)                    │
└────┬───────────────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────────────────┐
│ 4. AI/ML sends text to Gemini API                          │
│    - Extract course information                            │
│    - Parse assignments, exams, projects                    │
│    - Identify dates and deadlines                          │
│    - Structure into JSON format                            │
└────┬───────────────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────────────────┐
│ 5. AI/ML returns structured JSON to backend                │
│    {                                                        │
│      "course_name": "...",                                  │
│      "professor": {...},                                    │
│      "assignments": [...],                                  │
│      "exams": [...]                                         │
│    }                                                        │
└────┬───────────────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────────────────┐
│ 6. Backend saves to Firebase Firestore                     │
│    - Store in 'syllabi' collection                         │
│    - Associate with user ID                                │
│    - Add timestamp and metadata                            │
└────┬───────────────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────────────────┐
│ 7. Backend returns data to frontend                        │
└────┬───────────────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────────────────┐
│ 8. Frontend displays parsed events in modal                │
│    - User can edit events                                  │
│    - User can add/remove events                            │
│    - User can save to calendar                             │
└────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Frontend → Backend

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload & process syllabus PDF |
| GET | `/upload/history` | Get user's upload history |
| GET | `/upload/{id}` | Get specific syllabus by ID |
| POST | `/calendar/sync/{id}` | Sync syllabus to Google Calendar |
| GET | `/calendar/events` | Get all calendar events |
| DELETE | `/calendar/events/{id}` | Delete calendar event |
| GET | `/auth/me` | Get current user profile |
| PUT | `/auth/preferences` | Update user preferences |

### Backend → AI/ML Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/extract` | Extract & analyze PDF syllabus |
| POST | `/extract-text-only` | Extract raw text only |
| GET | `/health` | Check service status |

## Security

```
┌──────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. Frontend                                             │
│     • Auth0 authentication (JWT tokens)                  │
│     • Client-side validation                             │
│     • Secure token storage                               │
│                                                          │
│  2. Backend                                              │
│     • JWT verification (Auth0)                           │
│     • CORS protection                                    │
│     • Request validation                                 │
│     • Rate limiting (TODO)                               │
│                                                          │
│  3. Database                                             │
│     • Firebase security rules                            │
│     • User-based access control                          │
│     • Encrypted connections                              │
│                                                          │
│  4. External APIs                                        │
│     • API key authentication (Gemini)                    │
│     • OAuth 2.0 (Google Calendar)                        │
│     • Environment variable secrets                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend:  Vercel (Next.js)                           │
│             • CDN distribution                          │
│             • Automatic HTTPS                           │
│             • Edge functions                            │
│                                                         │
│  Backend:   Vercel Serverless Functions                │
│             • Auto-scaling                              │
│             • Global distribution                       │
│                                                         │
│  AI/ML:     Cloud Run / Railway                        │
│             • Container deployment                      │
│             • Auto-scaling                              │
│                                                         │
│  Database:  Firebase (already cloud)                   │
│             • Global replication                        │
│             • Automatic backups                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Performance Considerations

- **PDF Processing**: 5-15 seconds (depends on PDF size/complexity)
- **Gemini API**: 5-20 seconds (depends on text length)
- **Total Upload Time**: 10-35 seconds
- **Caching**: Consider caching processed syllabi
- **Rate Limiting**: Implement to prevent abuse
- **File Size Limit**: Recommend 10MB max for PDFs

## Scalability

- **Horizontal Scaling**: All services are stateless
- **Database**: Firebase auto-scales
- **AI/ML**: Can deploy multiple instances
- **CDN**: Frontend assets cached globally
- **Queue System**: Consider adding for long-running tasks

---

**Last Updated**: October 4, 2025
