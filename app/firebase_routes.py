"""
Firebase Authentication Routes for TitleTesterPro v6
"""
import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.firebase_auth import FirebaseUser, get_firebase_service, FirebaseAuthService

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/auth", tags=["Firebase Authentication"])

# Security scheme
security = HTTPBearer()

class LoginRequest(BaseModel):
    idToken: str

class LoginResponse(BaseModel):
    success: bool
    user: Dict[str, Any]
    message: str

class UserProfile(BaseModel):
    uid: str
    email: Optional[str]
    display_name: Optional[str]
    photo_url: Optional[str]
    email_verified: bool

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    firebase_service: FirebaseAuthService = Depends(get_firebase_service)
) -> FirebaseUser:
    """Get current authenticated user from Firebase token"""
    try:
        # Extract token from Authorization header
        token = credentials.credentials
        
        # Verify Firebase token
        firebase_user = firebase_service.verify_id_token(token)
        
        logger.info(f"Authenticated user: {firebase_user.email}")
        return firebase_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_current_user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

@router.post("/firebase/login", response_model=LoginResponse)
async def firebase_login(
    request: LoginRequest,
    firebase_service: FirebaseAuthService = Depends(get_firebase_service)
):
    """Authenticate user with Firebase ID token"""
    try:
        # Verify Firebase ID token
        firebase_user = firebase_service.verify_id_token(request.idToken)
        
        logger.info(f"User logged in: {firebase_user.email}")
        
        return LoginResponse(
            success=True,
            user={
                "uid": firebase_user.uid,
                "email": firebase_user.email,
                "display_name": firebase_user.display_name,
                "photo_url": firebase_user.photo_url,
                "email_verified": firebase_user.email_verified
            },
            message="Login successful"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Login failed"
        )

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: FirebaseUser = Depends(get_current_user)
):
    """Get current user profile"""
    return UserProfile(
        uid=current_user.uid,
        email=current_user.email,
        display_name=current_user.display_name,
        photo_url=current_user.photo_url,
        email_verified=current_user.email_verified
    )

@router.get("/status")
async def auth_status():
    """Check authentication service status"""
    try:
        firebase_service = get_firebase_service()
        return {
            "status": "healthy",
            "service": "firebase",
            "initialized": firebase_service.app is not None,
            "version": "6.0.0"
        }
    except Exception as e:
        logger.error(f"Auth status check failed: {e}")
        return {
            "status": "error",
            "service": "firebase",
            "initialized": False,
            "error": str(e),
            "version": "6.0.0"
        }

@router.post("/logout")
async def logout():
    """Logout endpoint"""
    return {
        "success": True,
        "message": "Logout successful. Please clear client-side tokens."
    }

@router.get("/me")
async def get_current_user_info(
    current_user: FirebaseUser = Depends(get_current_user)
):
    """Get current user information"""
    return {
        "uid": current_user.uid,
        "email": current_user.email,
        "display_name": current_user.display_name,
        "photo_url": current_user.photo_url,
        "email_verified": current_user.email_verified
    }