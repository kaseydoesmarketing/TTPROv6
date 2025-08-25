from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="TTPROv6 Minimal API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "TTPROv6 Backend is running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "6.0.0"}

@app.post("/api/auth/firebase")
async def firebase_auth():
    return {"message": "Firebase auth endpoint placeholder"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)