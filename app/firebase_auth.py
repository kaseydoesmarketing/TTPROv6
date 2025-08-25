"""
Firebase Authentication module for TitleTesterPro v6
Handles user authentication via Firebase Auth
"""
import os
import json
import logging
from typing import Optional, Dict, Any
from firebase_admin import auth as firebase_auth, credentials, initialize_app
import firebase_admin
from fastapi import HTTPException, status
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class FirebaseUser(BaseModel):
    uid: str
    email: Optional[str]
    email_verified: bool
    display_name: Optional[str]
    photo_url: Optional[str]
    custom_claims: Dict[str, Any] = {}

class FirebaseAuthService:
    """Firebase Authentication Service for TTPROv6"""
    
    def __init__(self):
        self.app = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase is already initialized
            if firebase_admin._apps:
                self.app = firebase_admin.get_app()
                logger.info("Firebase Admin SDK already initialized")
                return
            
            # Method 1: Service Account JSON file
            service_account_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
            if service_account_path and os.path.exists(service_account_path):
                logger.info(f"Initializing Firebase with service account file: {service_account_path}")
                cred = credentials.Certificate(service_account_path)
                self.app = initialize_app(cred)
                return
            
            # Method 2: Environment variables (Production)
            project_id = os.getenv('FIREBASE_PROJECT_ID')
            client_email = os.getenv('FIREBASE_CLIENT_EMAIL')  
            private_key = os.getenv('FIREBASE_PRIVATE_KEY')
            
            if project_id and client_email and private_key:
                logger.info("Initializing Firebase with environment variables")
                # Fix private key formatting
                private_key = private_key.replace('\\n', '\n')
                if not private_key.startswith('-----BEGIN PRIVATE KEY-----'):
                    private_key = f"-----BEGIN PRIVATE KEY-----\n{private_key}\n-----END PRIVATE KEY-----"
                
                service_account_info = {
                    "type": "service_account",
                    "project_id": project_id,
                    "client_email": client_email,
                    "private_key": private_key,
                    "client_id": os.getenv('FIREBASE_CLIENT_ID', ''),
                    "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID', ''),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{client_email}"
                }
                
                cred = credentials.Certificate(service_account_info)
                self.app = initialize_app(cred)
                return
            
            # Method 3: Default credentials (Development)
            logger.warning("No explicit Firebase credentials found, trying default credentials")
            cred = credentials.ApplicationDefault()
            self.app = initialize_app(cred)
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
            self.app = None
            # Don't raise in production - allow service to start
            if os.getenv('ENVIRONMENT') != 'production':
                raise
    
    def verify_id_token(self, id_token: str) -> FirebaseUser:
        """Verify Firebase ID token and return user info"""
        try:
            if not self.app:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Firebase not initialized"
                )
            
            # Verify the token
            decoded_token = firebase_auth.verify_id_token(id_token)
            
            return FirebaseUser(
                uid=decoded_token['uid'],
                email=decoded_token.get('email'),
                email_verified=decoded_token.get('email_verified', False),
                display_name=decoded_token.get('name'),
                photo_url=decoded_token.get('picture'),
                custom_claims=decoded_token.get('custom_claims', {})
            )
            
        except firebase_auth.InvalidIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Firebase ID token"
            )
        except firebase_auth.ExpiredIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Firebase ID token has expired"
            )
        except Exception as e:
            logger.error(f"Error verifying Firebase ID token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed"
            )

# Global Firebase service instance
firebase_service = None

def get_firebase_service() -> FirebaseAuthService:
    """Get Firebase service instance (singleton)"""
    global firebase_service
    if firebase_service is None:
        firebase_service = FirebaseAuthService()
    return firebase_service

def verify_firebase_token(id_token: str) -> FirebaseUser:
    """Convenience function to verify Firebase ID token"""
    return get_firebase_service().verify_id_token(id_token)