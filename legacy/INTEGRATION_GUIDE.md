# 🚀 SyllabusSync Full Stack Integration Guide

## 📁 Project Structure

```
HackUTA-2025/
├── ai_ml/              # AI/ML Microservice (Port 5050)
│   ├── api.py         # FastAPI wrapper for AI service
│   ├── main.py        # PDF text extraction
│   ├── gemini_extractor.py
│   └── .env           # GEMINI_API_KEY
│
├── backend/           # FastAPI Backend (Port 8000)
│   ├── main.py        # Main FastAPI app
│   ├── routers/       # API endpoints
│   ├── services/      # Business logic
│   ├── db/            # Firebase integration
│   └── .env           # Backend config
│
└── frontend/          # Next.js Frontend (Port 3000)
    ├── app/
    │   ├── lib/api.ts # API service layer
    │   └── page.tsx   # Main upload page
    └── .env.local     # Frontend config
```

## 🔧 Environment Setup

### 1. AI/ML Service (.env in `ai_ml/`)

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Backend Service (.env in `backend/`)

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Service URLs
AI_ML_URL=http://localhost:5050
FRONTEND_ORIGIN=http://localhost:3000

# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://syllabus-sync-api
```

### 3. Frontend (.env.local in `frontend/`)

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Auth0 (Frontend)
NEXT_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-frontend-client-id
NEXT_PUBLIC_AUTH0_AUDIENCE=https://syllabus-sync-api

# Optional: Direct AI/ML access
NEXT_PUBLIC_AI_ML_URL=http://localhost:5050
```

## 🏃 Running the Full Stack

### Terminal 1: AI/ML Service

```bash
cd ai_ml
pip install -r requirements.txt  # If requirements.txt exists
# Or install manually:
pip install fastapi uvicorn python-dotenv pdfplumber pdf2image pytesseract Pillow google-generativeai

# Run the service
python api.py
```

**Expected output:** `AI/ML Service running on http://0.0.0.0:5050`

### Terminal 2: Backend Service

```bash
cd backend
source venv/bin/activate  # Or: source ../syllabus-sync-backend/venv/bin/activate
pip install -r requirements.txt

# Run the service
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:** `Backend running on http://0.0.0.0:8000`

### Terminal 3: Frontend

```bash
cd frontend
npm install  # If not already done
npm run dev
```

**Expected output:** `Frontend running on http://localhost:3000`

## 🔄 Data Flow

```
1. User uploads PDF in Frontend (localhost:3000)
   ↓
2. Frontend calls Backend API (localhost:8000/upload)
   ↓
3. Backend forwards PDF to AI/ML Service (localhost:5050/extract)
   ↓
4. AI/ML extracts text + analyzes with Gemini
   ↓
5. AI/ML returns structured JSON to Backend
   ↓
6. Backend saves to Firebase Firestore
   ↓
7. Backend returns data to Frontend
   ↓
8. Frontend displays parsed events in modal
```

## 📡 API Endpoints

### AI/ML Service (Port 5050)

- `GET /` - Health check
- `GET /health` - Service status
- `POST /extract` - Upload PDF, get structured syllabus data
- `POST /extract-text-only` - Extract raw text only

### Backend (Port 8000)

- `GET /` - Health check
- `POST /upload` - Upload syllabus (calls AI/ML service)
- `GET /upload/history` - Get upload history
- `GET /upload/{id}` - Get specific syllabus
- `POST /calendar/sync/{id}` - Sync to Google Calendar
- `GET /calendar/events` - Get calendar events
- `DELETE /calendar/events/{id}` - Delete event
- `GET /auth/me` - Get user profile
- `PUT /auth/preferences` - Update preferences

### Frontend (Port 3000)

- `/` - Main upload page
- `/calendar` - Calendar view
- `/kanban` - Kanban board view
- `/demo` - Demo page

## 🧪 Testing the Integration

### 1. Test AI/ML Service

```bash
curl http://localhost:5050/health
```

Expected: `{"status": "healthy", "gemini_configured": true}`

### 2. Test Backend

```bash
curl http://localhost:8000/
```

Expected: `{"status": "Backend running", "message": "SyllabusSync API is operational"}`

### 3. Test Frontend

Open browser: `http://localhost:3000`

### 4. Test Full Flow

1. Open `http://localhost:3000`
2. Upload a PDF syllabus
3. Click "Process Syllabus"
4. Check browser console for API calls
5. Verify parsed events appear in modal

## 🐛 Troubleshooting

### AI/ML Service Not Starting

```bash
# Check if port 5050 is in use
lsof -i :5050

# Kill process if needed
kill -9 <PID>

# Check GEMINI_API_KEY
echo $GEMINI_API_KEY
```

### Backend Not Connecting to AI/ML

```bash
# Test AI/ML endpoint
curl -X POST http://localhost:5050/extract \
  -F "file=@path/to/test.pdf"

# Check backend logs for connection errors
# Update AI_ML_URL in backend/.env if needed
```

### Frontend Not Calling Backend

1. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
2. Restart Next.js dev server after changing .env
3. Check browser console for CORS errors
4. Verify backend CORS allows `http://localhost:3000`

### Firebase Connection Issues

```bash
# Check Firebase credentials in backend/.env
# Verify FIREBASE_PRIVATE_KEY has proper newlines
# Test Firebase connection:
cd backend
python -c "from db.database import connect_to_firebase; import asyncio; asyncio.run(connect_to_firebase())"
```

## 📊 Monitoring

### Check All Services Status

```bash
# AI/ML
curl http://localhost:5050/health

# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000
```

### View Logs

- **AI/ML**: Check terminal running `api.py`
- **Backend**: Check terminal running `uvicorn`
- **Frontend**: Check terminal running `npm run dev` + browser console

## 🎯 Next Steps

1. ✅ All services running
2. ✅ Test file upload end-to-end
3. ✅ Verify Firebase saves data
4. ⏳ Add Auth0 authentication
5. ⏳ Implement Google Calendar sync
6. ⏳ Deploy to production

## 🔐 Security Notes

- Never commit `.env` files
- Use environment variables for all secrets
- In production, use proper CORS origins (not `*`)
- Enable Auth0 for all protected endpoints
- Use HTTPS in production

## 📝 Common Commands

```bash
# Start all services (in separate terminals)
cd ai_ml && python api.py
cd backend && uvicorn main:app --reload --port 8000
cd frontend && npm run dev

# Stop all services
# Press Ctrl+C in each terminal

# View running processes
ps aux | grep python
ps aux | grep node

# Check ports
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5050  # AI/ML
```

## 🎉 Success Checklist

- [ ] AI/ML service responds at http://localhost:5050
- [ ] Backend service responds at http://localhost:8000
- [ ] Frontend loads at http://localhost:3000
- [ ] Can upload PDF file in frontend
- [ ] PDF gets processed by AI/ML service
- [ ] Parsed data appears in frontend modal
- [ ] Data saves to Firebase
- [ ] No CORS errors in browser console

---

**Need help?** Check the logs in each terminal window for detailed error messages.
