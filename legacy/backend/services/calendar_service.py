from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
import os
from typing import List, Dict, Any
from loguru import logger

# Google Calendar API configuration
SCOPES = ['https://www.googleapis.com/auth/calendar']
CLIENT_SECRETS_FILE = 'client_secret.json'  # You'll need to download this from Google Cloud Console

class CalendarService:
    def __init__(self):
        self.service = None
    
    def build_service(self, credentials: Credentials):
        """Build Google Calendar service with credentials"""
        self.service = build('calendar', 'v3', credentials=credentials)
    
    async def create_calendar_events(
        self, 
        assignments: List[Dict[str, Any]], 
        course_name: str
    ) -> List[Dict[str, Any]]:
        """
        Create calendar events from syllabus assignments
        
        Args:
            assignments: List of assignment dictionaries
            course_name: Name of the course
            
        Returns:
            List of created event IDs
        """
        if not self.service:
            raise ValueError("Calendar service not initialized")
        
        created_events = []
        
        for assignment in assignments:
            try:
                event = {
                    'summary': f"{course_name}: {assignment.get('title', 'Assignment')}",
                    'description': assignment.get('description', ''),
                    'start': {
                        'date': assignment.get('date', '2024-01-01'),
                        'timeZone': 'America/New_York',
                    },
                    'end': {
                        'date': assignment.get('date', '2024-01-01'),
                        'timeZone': 'America/New_York',
                    },
                    'reminders': {
                        'useDefault': False,
                        'overrides': [
                            {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                            {'method': 'popup', 'minutes': 60},       # 1 hour before
                        ],
                    },
                }
                
                created_event = self.service.events().insert(
                    calendarId='primary',
                    body=event
                ).execute()
                
                created_events.append({
                    'event_id': created_event['id'],
                    'assignment_title': assignment.get('title', ''),
                    'date': assignment.get('date', '')
                })
                
                logger.info(f"Created calendar event: {created_event['id']}")
                
            except Exception as e:
                logger.error(f"Failed to create event for assignment {assignment.get('title', '')}: {e}")
                continue
        
        return created_events
    
    async def get_calendar_events(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """
        Get calendar events within date range
        
        Args:
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            
        Returns:
            List of calendar events
        """
        if not self.service:
            raise ValueError("Calendar service not initialized")
        
        try:
            events_result = self.service.events().list(
                calendarId='primary',
                timeMin=f"{start_date}T00:00:00Z",
                timeMax=f"{end_date}T23:59:59Z",
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            formatted_events = []
            for event in events:
                formatted_events.append({
                    'id': event['id'],
                    'summary': event.get('summary', ''),
                    'description': event.get('description', ''),
                    'start': event['start'].get('dateTime', event['start'].get('date')),
                    'end': event['end'].get('dateTime', event['end'].get('date')),
                })
            
            return formatted_events
            
        except Exception as e:
            logger.error(f"Failed to fetch calendar events: {e}")
            raise
