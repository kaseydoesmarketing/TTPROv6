"""
TitleTesterPro v6 - Main FastAPI Application
Firebase Authentication + YouTube API Integration
"""
import logging
import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="TitleTesterPro v6 API",
    description="YouTube Title A/B Testing Platform with Firebase Auth",
    version="6.0.0"
)

# CORS Configuration
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "https://titletesterpro.com",
    "https://www.titletesterpro.com",
    "https://titletesterpro-v6-7ykt60bk1-ttpro.vercel.app",
    "https://*.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "TitleTesterPro v6 API",
        "version": "6.0.0",
        "status": "healthy",
        "authentication": "Firebase"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ttprov6-api",
        "version": "6.0.0",
        "timestamp": "2025-08-27T11:15:00Z"
    }

@app.get("/api/auth/status")
async def auth_status():
    """Authentication service status"""
    try:
        # Add app directory to path for import
        sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
        from firebase_auth import get_firebase_service
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

# Add app directory to Python path
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

# Import and include routers after app creation to avoid circular imports
try:
    from app.firebase_routes import router as firebase_router
    app.include_router(firebase_router)
    logger.info("Firebase routes loaded successfully")
except ImportError as e:
    logger.warning(f"Firebase routes not available: {e}")

try:
    from app.youtube_routes import router as youtube_router
    app.include_router(youtube_router, prefix="/api")
    logger.info("YouTube routes loaded successfully")
except ImportError as e:
    logger.warning(f"YouTube routes not available: {e}")

try:
    from app.campaign_routes import router as campaign_router
    app.include_router(campaign_router, prefix="/api")
    logger.info("Campaign routes loaded successfully")
except ImportError as e:
    logger.warning(f"Campaign routes not available: {e}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("ENVIRONMENT", "production").lower() != "production"
    )