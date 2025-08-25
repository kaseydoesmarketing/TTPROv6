# TTPROv6 Backend Deployment Instructions

## Critical: Manual Render Deployment Required

The backend service needs to be created manually on Render due to API limitations.

### Step 1: Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect GitHub repository: `https://github.com/kaseydoesmarketing/TTPROv6`
4. Select branch: `main`

### Step 2: Configure Service Settings

**Basic Configuration:**
- **Name:** `TTPROv6-API` 
- **Environment:** Python 3
- **Region:** Oregon (US West)
- **Branch:** main
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Plan:** Starter ($7/month)

### Step 3: Environment Variables

Add these environment variables in Render dashboard:

```bash
# Core Configuration
ENVIRONMENT=production

# Database (Already Created)
DATABASE_URL=postgresql://ttprouser:yourpassword@dpg-d2ma1dnfte5s73d03ed0-a.oregon-postgres.render.com/ttprodbv6

# Firebase Authentication
FIREBASE_PROJECT_ID=titletesterpro
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@titletesterpro.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_ID=9b0f3af4c2448c4597a71a453ba903d2dfb5241f
FIREBASE_CLIENT_ID=112229313960983535645
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD283dv831xzokx
CbQzlP/aTptBn9ZP5IMRJpyQbH4Ruped6TkJj2nuAoDmx4TX05WTcU75q0MmuM9i
5UDndBUTi7egJSxVZJVkIFzcSVuFGH8nky7wfUzNzHYe8zctTJrLdYMF7fk5+B99
QrJ616trAgvf4+6WcESDMvIKk5SRwlgUofIn53Bcs9+Tc6i6uHlIILz7/gdKf+1S
hc6trtgBXFMl8znno9MUULz3yjsOnRGS5puElfc4IbLeNHEoPkCRF1cLhqVHRi0Z
Rp/UU8Ns/J7rw/vdj2FPQWYCzkC4TNMUt6hQ8ZZ6Ci2YaSNTXLiOAWc3UXCAxiQO
eZ5j2qyvAgMBAAECggEADEEOQF0uDP8QiIEiYPipw4Wh0hY3i8M/DC/hecj3ivpz
bCUvuv1Tyg5z25UlFef3MvttBovTx5tlUjbtSy7wSJRKdsGjPrakM1jn/WYp0dWN
MGdEX2jCGPati9otr88K8Ajk7LRYaQ1hqU30eQCXuO7qHkP7ZigBrzhQkaQfAu2h
b/CJPiLWvBuJ/YYFRIbuAeIZ4qlO2AQTle9IF2UnWFsTQ16tVHI7n3VbVWnFKHJn
Ou8vZpHlyYlawbOoqdoNieD0NoYXPEjU8TlJrcWMF/JoU8toDtJNQevrMeHleXjs
WqtwROIhyIOScShI7R/G4Ek/1ADHxf+AFc6zrCsq3QKBgQD7ivt1T2vIzdsEath3
wRdxyT6HzzYQx7IQfw5AonHjODSF+QsO9KBypbj1pakleiEhdyLy3wStatsHgDPg
cLuQbpZqFqJ7kJZUZNQ+PmoHm1khLwT+rHlGo5fBtCYZx5UZ0MTP7Dm9p3wpdm4S
2iefe3Y20uVmC/uVeZjlQAc3ywKBgQD7U6fAFbCRiupyUR++u2Gis40v44jxeCKb
9LpI93/lnBKvwZPg5klLxUTa9AQvLWeqtmpRAw3TL4LZZWmxTkxNMJhQyIogeVHe
RacnGwFkBnstp6uR76EJq+OqmB8DIh9GeNewAcMyGKlTlhmrvvjKQrSshq2mM9xz
SRDe1tnaLQKBgALSMTXEmUHcRSuMgzb8nGWzSxc81K9lffK/agqBh+NzeutRurUF
O1Nt1mAy5m28K+jzLBorNCM5wpEX9/z5ZrEc/GTeMh5OpdD2fIbiLlA9hsdffp/Y
kVegeBA9E/xQB7UNaVenn5In8bWJVXyyo6UfPlkpDleRpNWtUnCnwiz3AoGBAJDy
dUv19mhqKr6VhO52mV/BmArnemJxO9ygLxPIEi41bh2JUiUiC2G0uvpgQ02GLUSq
gfSJA18qBpgkwektVBosjZwBnJAQCCReHYITNCEhD8eL7Qp0nna6eMo5g6FF+62k
IhjzW0U4Lef0KIgB0vCruhHKdrnlLR4cJKuwU+JdAoGACWc0bSpONG6mH5qhvOIR
wTDkujiOYUfk4euMdYAdDb8x5DDck/0w72R5z83H7+ZjtFU5Zs/R3KPwyz9TeDga
HxQP5OSVY9uaQztMkvjfjozbNsSYVyfvUn8Rvls+DCrjyrlDsHOdkv24B9BY08tm
VD9kzb2CMpLjx+vh9wadEIg=
-----END PRIVATE KEY-----"

# YouTube API (Get from Google Cloud Console)
YOUTUBE_API_KEY=your_youtube_api_key_here

# OAuth Configuration (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_oauth_client_id_here
GOOGLE_CLIENT_SECRET=your_oauth_client_secret_here

# Security
ENCRYPTION_KEY=generate_32_character_random_key_here
CRON_SECRET=generate_random_cron_secret_here

# Application URLs
APP_BASE_URL=https://titletesterpro.com
```

### Step 4: Deploy Service

1. Click "Create Web Service"
2. Wait for initial deployment (5-10 minutes)
3. The service URL will be: `https://ttprov6-api.onrender.com`

### Step 5: Update Frontend Configuration

After backend deployment, the frontend at `https://titletesterpro-v6-babfgut04-ttpro-live.vercel.app` will automatically connect to the backend via the rewrites in `next.config.js`:

```javascript
rewrites: [
  {
    source: '/api/:path*',
    destination: 'https://ttprov6-api.onrender.com/api/:path*'
  }
]
```

## Current Status

✅ **Frontend Deployed:** https://titletesterpro-v6-babfgut04-ttpro-live.vercel.app  
❌ **Backend Pending:** Manual creation required on Render dashboard  
✅ **PostgreSQL Database:** dpg-d2ma1dnfte5s73d03ed0-a (ready)  
✅ **Firebase Configuration:** Complete with titletesterpro project credentials

## Next Steps After Backend Deployment

1. Test Firebase authentication: https://titletesterpro-v6-babfgut04-ttpro-live.vercel.app/app
2. Verify Google Sign-in functionality 
3. Update DNS to point titletesterpro.com → frontend
4. Configure YouTube API keys and OAuth credentials

## Support URLs

- Frontend: https://titletesterpro-v6-babfgut04-ttpro-live.vercel.app
- Backend: https://ttprov6-api.onrender.com (after manual creation)
- Database: dpg-d2ma1dnfte5s73d03ed0-a.oregon-postgres.render.com