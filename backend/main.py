from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from routers import upload, calendar, auth
from db.database import connect_to_firebase, close_firebase_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_firebase()
    yield
    # Shutdown
    await close_firebase_connection()

# Initialize FastAPI app
app = FastAPI(
    title="SyllabusSync Backend API",
    description="Backend API for SyllabusSync - AI-powered syllabus processing and calendar integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
AI_ML_URL = os.getenv("AI_ML_URL", "http://localhost:5050")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, AI_ML_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router)
app.include_router(calendar.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    """Root endpoint to check if backend is running"""
    return {"status": "Backend running", "message": "SyllabusSync API is operational"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
