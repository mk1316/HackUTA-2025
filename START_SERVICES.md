# 🚀 Quick Start Guide - Run All Services

## Prerequisites

1. **Python 3.11+** installed
2. **Node.js 18+** installed
3. **Environment files configured** (see below)

## 📝 Environment Setup (First Time Only)

### 1. AI/ML Service

```bash
cd ai_ml
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 2. Backend Service

```bash
cd backend
cp .env.example .env
# Edit .env and add your Firebase credentials and Auth0 config
```

### 3. Frontend

```bash
cd frontend
# .env.local already created
# Update with your Auth0 frontend credentials if needed
```

## 🏃 Start All Services

### Option 1: Manual (Recommended for Development)

Open **3 separate terminal windows**:

#### Terminal 1: AI/ML Service (Port 5050)

```bash
cd ai_ml
pip install fastapi uvicorn python-dotenv pdfplumber pdf2image pytesseract Pillow google-generativeai
python api.py
```

✅ Should see: `Uvicorn running on http://0.0.0.0:5050`

#### Terminal 2: Backend Service (Port 8000)

```bash
cd backend
source venv/bin/activate  # Or: source ../syllabus-sync-backend/venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ Should see: `Uvicorn running on http://0.0.0.0:8000`

#### Terminal 3: Frontend (Port 3000)

```bash
cd frontend
npm install  # First time only
npm run dev
```

✅ Should see: `Local: http://localhost:3000`

### Option 2: Using tmux (Advanced)

```bash
# Start all services in one tmux session
tmux new-session -d -s syllabus 'cd ai_ml && python api.py'
tmux split-window -h 'cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000'
tmux split-window -v 'cd frontend && npm run dev'
tmux attach -t syllabus
```

## ✅ Verify Services Are Running

Open these URLs in your browser:

1. **Frontend**: http://localhost:3000 (Main app)
2. **Backend API Docs**: http://localhost:8000/docs (Swagger UI)
3. **AI/ML Health**: http://localhost:5050/health (JSON response)

Or use curl:

```bash
# Check all services
curl http://localhost:5050/health  # AI/ML
curl http://localhost:8000/health  # Backend
curl http://localhost:3000         # Frontend
```

## 🎯 Test the Full Integration

1. Open http://localhost:3000
2. Click "Upload Syllabus" or drag & drop a PDF
3. Click "Process Syllabus"
4. Wait for AI processing (may take 10-30 seconds)
5. View parsed events in the modal

## 🛑 Stop All Services

Press `Ctrl+C` in each terminal window.

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port
lsof -i :5050  # or :8000 or :3000
kill -9 <PID>
```

### AI/ML Service Errors

- Check `GEMINI_API_KEY` is set in `ai_ml/.env`
- Verify API key is valid: https://makersuite.google.com/app/apikey

### Backend Errors

- Check Firebase credentials in `backend/.env`
- Verify `AI_ML_URL=http://localhost:5050` is set
- Check backend logs for detailed errors

### Frontend Not Connecting

- Verify `NEXT_PUBLIC_API_URL=http://localhost:8000` in `frontend/.env.local`
- Restart Next.js dev server after changing .env
- Check browser console for errors

### CORS Errors

- Backend should allow `http://localhost:3000`
- Check backend terminal for CORS-related logs

## 📊 Service Status Dashboard

Create a simple status check:

```bash
#!/bin/bash
echo "🔍 Checking Services..."
echo ""
echo "AI/ML (5050):"
curl -s http://localhost:5050/health | python -m json.tool || echo "❌ Not running"
echo ""
echo "Backend (8000):"
curl -s http://localhost:8000/health | python -m json.tool || echo "❌ Not running"
echo ""
echo "Frontend (3000):"
curl -s http://localhost:3000 > /dev/null && echo "✅ Running" || echo "❌ Not running"
```

Save as `check_services.sh` and run: `bash check_services.sh`

## 🎉 Success!

If all three services are running and you can upload a PDF:

✅ **Your full stack is integrated!**

Next steps:
- Add Auth0 authentication
- Implement Google Calendar sync
- Deploy to production

---

**Need help?** Check `INTEGRATION_GUIDE.md` for detailed troubleshooting.
