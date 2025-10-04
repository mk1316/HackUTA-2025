import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
from loguru import logger

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if Firebase is already initialized
        if firebase_admin._apps:
            logger.info("Firebase already initialized")
            return firestore.client()
        
        # Check if Firebase credentials are available
        project_id = os.getenv("FIREBASE_PROJECT_ID")
        private_key = os.getenv("FIREBASE_PRIVATE_KEY")
        
        if not project_id or not private_key:
            logger.warning("Firebase credentials not found. Using default credentials or emulator.")
            # For development, try to use default credentials or emulator
            try:
                firebase_admin.initialize_app()
                db = firestore.client()
                logger.info("Successfully initialized Firebase with default credentials")
                return db
            except Exception as e:
                logger.error(f"Failed to initialize Firebase with default credentials: {e}")
                # Return a mock client for development
                return None
        
        # Get Firebase configuration from environment variables
        if private_key:
            private_key = private_key.replace('\\n', '\n')
        
        firebase_config = {
            "type": "service_account",
            "project_id": project_id,
            "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
            "private_key": private_key,
            "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
            "client_id": os.getenv("FIREBASE_CLIENT_ID"),
            "auth_uri": os.getenv("FIREBASE_AUTH_URI", "https://accounts.google.com/o/oauth2/auth"),
            "token_uri": os.getenv("FIREBASE_TOKEN_URI", "https://oauth2.googleapis.com/token"),
        }
        
        # Create credentials object
        cred = credentials.Certificate(firebase_config)
        
        # Initialize Firebase Admin SDK
        firebase_admin.initialize_app(cred)
        
        # Get Firestore client
        db = firestore.client()
        
        logger.info("Successfully initialized Firebase Admin SDK")
        return db
        
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        raise

# Initialize Firestore client
db = initialize_firebase()

# Collections references (handle case where db might be None for development)
if db:
    syllabi_collection = db.collection('syllabi')
    users_collection = db.collection('users')
else:
    # Mock collections for development when Firebase is not available
    syllabi_collection = None
    users_collection = None

async def connect_to_firebase():
    """Connect to Firebase Firestore"""
    try:
        if db is None:
            logger.warning("Firebase not initialized. Running in development mode without database.")
            return
        
        # Test the connection by getting a document count
        syllabi_ref = db.collection('syllabi')
        docs = syllabi_ref.limit(1).stream()
        list(docs)  # Execute the query
        logger.info("Successfully connected to Firebase Firestore")
    except Exception as e:
        logger.error(f"Failed to connect to Firebase Firestore: {e}")
        # Don't raise in development mode
        logger.warning("Continuing without database connection for development")

async def close_firebase_connection():
    """Close Firebase connection"""
    try:
        # Firebase Admin SDK doesn't require explicit connection closing
        logger.info("Firebase connection closed")
    except Exception as e:
        logger.error(f"Error closing Firebase connection: {e}")
