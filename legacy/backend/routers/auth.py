from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from datetime import datetime

from utils.auth0_utils import get_current_user
from db.database import users_collection

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/me")
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get current authenticated user information
    
    Args:
        current_user: Authenticated user information from JWT
        
    Returns:
        User profile information
    """
    try:
        # Check if user exists in Firestore, create if not
        user_query = users_collection.where("user_id", "==", current_user["user_id"])
        user_docs = list(user_query.stream())
        
        if not user_docs:
            # Create new user document
            new_user = {
                "user_id": current_user["user_id"],
                "email": current_user["email"],
                "name": current_user["name"],
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow(),
                "preferences": {
                    "calendar_sync": False,
                    "notifications": True
                }
            }
            
            doc_ref = users_collection.add(new_user)
            user_doc = {**new_user, "_id": doc_ref.id}
        else:
            # Update last login
            user_doc_ref = users_collection.document(user_docs[0].id)
            user_doc_ref.update({"last_login": datetime.utcnow()})
            user_doc = user_docs[0].to_dict()
            user_doc["_id"] = user_docs[0].id
        
        # Remove sensitive information
        user_doc.pop("_id", None)
        
        return {
            "success": True,
            "data": user_doc
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get user information: {str(e)}"
        )

@router.put("/preferences")
async def update_user_preferences(
    preferences: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Update user preferences
    
    Args:
        preferences: User preferences to update
        current_user: Authenticated user information
        
    Returns:
        Updated user preferences
    """
    try:
        # Validate preferences
        allowed_preferences = ["calendar_sync", "notifications", "timezone"]
        
        filtered_preferences = {
            key: value for key, value in preferences.items() 
            if key in allowed_preferences
        }
        
        if not filtered_preferences:
            raise HTTPException(
                status_code=400,
                detail="No valid preferences provided"
            )
        
        # Find user document
        user_query = users_collection.where("user_id", "==", current_user["user_id"])
        user_docs = list(user_query.stream())
        
        if not user_docs:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        
        # Update user preferences
        user_doc_ref = users_collection.document(user_docs[0].id)
        
        # Update preferences field by field
        for key, value in filtered_preferences.items():
            user_doc_ref.update({f"preferences.{key}": value})
        
        # Get updated user document
        updated_doc = user_doc_ref.get()
        updated_user = updated_doc.to_dict()
        
        return {
            "success": True,
            "message": "Preferences updated successfully",
            "data": {
                "preferences": updated_user.get("preferences", {})
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update preferences: {str(e)}"
        )

@router.get("/status")
async def auth_status() -> Dict[str, Any]:
    """
    Check authentication status (public endpoint)
    
    Returns:
        Authentication configuration status
    """
    return {
        "success": True,
        "data": {
            "auth_required": True,
            "auth_provider": "Auth0",
            "status": "configured"
        }
    }
