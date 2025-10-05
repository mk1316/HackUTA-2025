from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Dict, Any
import os
from datetime import datetime
import uuid
from firebase_admin import firestore
from loguru import logger

from services.ai_service import get_parsed_syllabus
from db.database import syllabi_collection
from utils.auth0_utils import get_current_user

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("/")
async def upload_syllabus(
    file: UploadFile = File(...),
    # current_user: Dict[str, Any] = Depends(get_current_user)  # Temporarily disabled for testing
) -> Dict[str, Any]:
    """
    Upload and parse syllabus file
    
    Args:
        file: Uploaded syllabus file (PDF)
        
    Returns:
        Success response with parsed syllabus data
    """
    # Mock user for testing (remove when Auth0 is fully integrated)
    current_user = {
        "user_id": "test_user",
        "email": "test@example.com",
        "name": "Test User"
    }
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )
    
    try:
        # Read file bytes
        file_bytes = await file.read()
        
        if len(file_bytes) == 0:
            raise HTTPException(
                status_code=400,
                detail="Empty file provided"
            )
        
        # Send to AI service for parsing
        parsed_data = await get_parsed_syllabus(file_bytes, file.filename)
        
        # Prepare document for MongoDB
        syllabus_doc = {
            "user_id": current_user["user_id"],
            "filename": file.filename,
            "uploaded_at": datetime.utcnow(),
            "parsed_data": parsed_data,
            "status": "processed"
        }
        
        # Save to Firestore
        if syllabi_collection is not None:
            timestamp, doc_ref = syllabi_collection.add(syllabus_doc)
            # Add document ID to response
            parsed_data["_id"] = doc_ref.id
        else:
            # Running without Firebase (development mode)
            parsed_data["_id"] = "dev_mode_no_db"
        
        return {
            "success": True,
            "data": parsed_data,
            "message": "Syllabus uploaded and processed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing syllabus upload: {e}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process syllabus: {str(e)}"
        )

@router.get("/history")
async def get_upload_history(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get user's syllabus upload history
    
    Args:
        current_user: Authenticated user information
        
    Returns:
        List of uploaded syllabi
    """
    try:
        # Query user's syllabi from Firestore
        query = syllabi_collection.where("user_id", "==", current_user["user_id"]).order_by("uploaded_at", direction=firestore.Query.DESCENDING)
        docs = query.stream()
        
        syllabi = []
        for doc in docs:
            doc_data = doc.to_dict()
            doc_data["_id"] = doc.id
            # Remove parsed_data for list view to reduce payload
            if "parsed_data" in doc_data:
                del doc_data["parsed_data"]
            syllabi.append(doc_data)
        
        return {
            "success": True,
            "data": syllabi
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch upload history: {str(e)}"
        )

@router.get("/{syllabus_id}")
async def get_syllabus(
    syllabus_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get specific syllabus by ID
    
    Args:
        syllabus_id: MongoDB ObjectId of the syllabus
        current_user: Authenticated user information
        
    Returns:
        Syllabus data with parsed content
    """
    try:
        # Find syllabus in Firestore
        doc_ref = syllabi_collection.document(syllabus_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(
                status_code=404,
                detail="Syllabus not found"
            )
        
        doc_data = doc.to_dict()
        
        # Check if user owns this syllabus
        if doc_data.get("user_id") != current_user["user_id"]:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
        
        doc_data["_id"] = doc.id
        
        return {
            "success": True,
            "data": doc_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch syllabus: {str(e)}"
        )
