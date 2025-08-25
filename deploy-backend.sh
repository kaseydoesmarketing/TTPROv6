#!/bin/bash

# TTPROv6 Backend Deployment Script
set -e

echo "🚀 Deploying TTPROv6 Backend to Render"
echo "======================================"

# Manual instructions for Render deployment
cat << 'EOF'
MANUAL DEPLOYMENT REQUIRED:

1. Go to Render Dashboard: https://dashboard.render.com/

2. Click "New +" -> "Web Service"

3. Connect GitHub repository:
   - Repository: https://github.com/kaseydoesmarketing/TTPROv6
   - Branch: main

4. Configure Service:
   - Name: TTPROv6-API
   - Environment: Python 3
   - Region: Oregon (US West)
   - Branch: main
   - Build Command: pip install -r requirements.txt
   - Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   - Plan: Starter ($7/month)

5. Environment Variables (Add these):
   ENVIRONMENT=production
   FIREBASE_PROJECT_ID=titletesterpro
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@titletesterpro.iam.gserviceaccount.com
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
   FIREBASE_PRIVATE_KEY_ID=9b0f3af4c2448c4597a71a453ba903d2dfb5241f
   FIREBASE_CLIENT_ID=112229313960983535645

6. Click "Create Web Service"

7. Wait for deployment to complete (5-10 minutes)

8. Note the service URL (will be something like ttprov6-api-xyz.onrender.com)

EOF

echo "✅ Manual deployment instructions generated"
echo "📋 After deployment, update the frontend next.config.js with the new backend URL"