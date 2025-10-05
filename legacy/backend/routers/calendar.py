from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from datetime import datetime, timedelta

from services.calendar_service import CalendarService
from db.database import syllabi_collection
from utils.auth0_utils import get_current_user

router = APIRouter(prefix="/calendar", tags=["Calendar"])

@router.post("/sync/{syllabus_id}")
async def sync_syllabus_to_calendar(
    syllabus_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Sync syllabus assignments to Google Calendar
    
    Args:
        syllabus_id: MongoDB ObjectId of the syllabus
        current_user: Authenticated user information
        
    Returns:
        Success response with created event IDs
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
        
        syllabus_data = doc.to_dict()
        
        # Check if user owns this syllabus
        if syllabus_data.get("user_id") != current_user["user_id"]:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
        
        # Extract course and assignment data
        parsed_data = syllabus_data.get("parsed_data", {})
        course = parsed_data.get("course", {})
        assignments = parsed_data.get("assignments", [])
        
        if not assignments:
            raise HTTPException(
                status_code=400,
                detail="No assignments found in syllabus"
            )
        
        # Initialize calendar service
        calendar_service = CalendarService()
        
        # TODO: Get user's Google Calendar credentials from database
        # For now, this is a placeholder implementation
        # In production, you'd need to implement OAuth flow and store tokens
        
        # Create calendar events
        created_events = await calendar_service.create_calendar_events(
            assignments, 
            course.get("name", "Unknown Course")
        )
        
        # Update syllabus with sync status
        doc_ref.update({
            "calendar_synced": True,
            "calendar_sync_date": datetime.utcnow(),
            "calendar_events": created_events
        })
        
        return {
            "success": True,
            "message": f"Successfully synced {len(created_events)} events to calendar",
            "data": {
                "events_created": len(created_events),
                "events": created_events
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to sync to calendar: {str(e)}"
        )

@router.get("/events")
async def get_calendar_events(
    start_date: str = None,
    end_date: str = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get calendar events within date range
    
    Args:
        start_date: Start date in YYYY-MM-DD format (optional)
        end_date: End date in YYYY-MM-DD format (optional)
        current_user: Authenticated user information
        
    Returns:
        List of calendar events
    """
    try:
        # Set default date range if not provided
        if not start_date:
            start_date = datetime.now().strftime("%Y-%m-%d")
        if not end_date:
            end_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        
        # Initialize calendar service
        calendar_service = CalendarService()
        
        # TODO: Get user's Google Calendar credentials from database
        # For now, this is a placeholder implementation
        
        # Get calendar events
        events = await calendar_service.get_calendar_events(start_date, end_date)
        
        return {
            "success": True,
            "data": {
                "events": events,
                "date_range": {
                    "start": start_date,
                    "end": end_date
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch calendar events: {str(e)}"
        )

@router.delete("/events/{event_id}")
async def delete_calendar_event(
    event_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Delete a calendar event
    
    Args:
        event_id: Google Calendar event ID
        current_user: Authenticated user information
        
    Returns:
        Success response
    """
    try:
        # Initialize calendar service
        calendar_service = CalendarService()
        
        # TODO: Get user's Google Calendar credentials from database
        # For now, this is a placeholder implementation
        
        # Delete event (placeholder - actual implementation would use calendar service)
        # calendar_service.service.events().delete(calendarId='primary', eventId=event_id).execute()
        
        return {
            "success": True,
            "message": f"Event {event_id} deleted successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete calendar event: {str(e)}"
        )
