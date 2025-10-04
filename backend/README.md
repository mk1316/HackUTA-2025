# SyllabusSync Backend

A FastAPI-based backend for the SyllabusSync application that provides AI-powered syllabus processing and Google Calendar integration.

## Features

- **File Upload**: Upload and process PDF syllabi using AI/ML microservice
- **Calendar Integration**: Sync assignments to Google Calendar
- **Authentication**: Auth0 JWT-based authentication
- **Database**: Firebase Firestore for storing syllabus data and user information
- **API Documentation**: Auto-generated Swagger/OpenAPI docs at `/docs`

## Quick Start

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run the Application**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Access API Documentation**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## API Endpoints

### Upload Router (`/upload`)
- `POST /upload` - Upload and process syllabus file
- `GET /upload/history` - Get user's upload history
- `GET /upload/{syllabus_id}` - Get specific syllabus

### Calendar Router (`/calendar`)
- `POST /calendar/sync/{syllabus_id}` - Sync syllabus to Google Calendar
- `GET /calendar/events` - Get calendar events
- `DELETE /calendar/events/{event_id}` - Delete calendar event

### Auth Router (`/auth`)
- `GET /auth/me` - Get current user information
- `PUT /auth/preferences` - Update user preferences
- `GET /auth/status` - Check auth status

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FIREBASE_PROJECT_ID` | Firebase project ID | Required |
| `FIREBASE_PRIVATE_KEY_ID` | Firebase private key ID | Required |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | Required |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | Required |
| `FIREBASE_CLIENT_ID` | Firebase client ID | Required |
| `AI_ML_URL` | AI/ML microservice URL | `http://localhost:5050` |
| `AUTH0_DOMAIN` | Auth0 domain | Required |
| `AUTH0_AUDIENCE` | Auth0 API audience | Required |
| `FRONTEND_ORIGIN` | Frontend URL for CORS | `http://localhost:5173` |

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── routers/                # API route handlers
│   ├── upload.py          # File upload endpoints
│   ├── calendar.py        # Calendar integration endpoints
│   └── auth.py            # Authentication endpoints
├── services/               # Business logic services
│   ├── ai_service.py      # AI/ML microservice integration
│   └── calendar_service.py # Google Calendar integration
├── db/                     # Database configuration
│   └── database.py        # Firebase Firestore connection setup
├── utils/                  # Utility functions
│   └── auth0_utils.py     # Auth0 JWT verification
├── requirements.txt        # Python dependencies
└── .env.example           # Environment variables template
```

## Dependencies

- **FastAPI**: Modern web framework for building APIs
- **Firebase Firestore**: NoSQL document database with Firebase Admin SDK
- **Auth0**: Authentication and authorization
- **Google Calendar API**: Calendar integration
- **Requests**: HTTP client for AI service communication

## Development

The backend integrates with:
- **AI/ML Microservice** (port 5050): For syllabus parsing using Gemini 1.5 Pro
- **Frontend** (port 5173): React application
- **Firebase Firestore**: For data persistence
- **Auth0**: For user authentication

## Deployment

The backend is designed to be deployed with Docker and supports both x86 and ARM architectures. See the Docker configuration files for deployment details.
