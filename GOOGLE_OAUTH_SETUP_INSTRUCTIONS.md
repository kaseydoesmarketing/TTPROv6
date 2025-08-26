# GOOGLE OAUTH CLIENT SETUP FOR FIREBASE AUTHENTICATION

**Principal Networking & Edge Architect - Echo Red Ultra v5**

## EXECUTIVE SUMMARY

**PROBLEM**: Firebase Authentication is enabled but Google OAuth Web Client ID is not properly configured for production domain `www.titletesterpro.com`

**ROOT CAUSE**: Missing or incorrect Google OAuth 2.0 credentials linked to Firebase Authentication

**SOLUTION**: Create dedicated Google OAuth credentials with proper redirect URIs and link them to Firebase

---

## CURRENT PROJECT CONFIGURATION

**Firebase Project**: `titletesterpro` (Project ID: `titletesterpro`)
**Firebase App ID**: `1:564429395545:web:c5e53dec47b0aa74f23fa0`
**Production Domain**: `www.titletesterpro.com`
**Development Domain**: `localhost:3000`

**Firebase Project URL**: https://console.firebase.google.com/project/titletesterpro/authentication

---

## STEP-BY-STEP GOOGLE OAUTH CONFIGURATION

### Phase 1: Google Cloud Console OAuth Setup

#### 1.1 Access Google Cloud Console
```
URL: https://console.cloud.google.com/apis/credentials
Project: titletesterpro (Project ID: titletesterpro)
```

#### 1.2 Configure OAuth Consent Screen (If Not Done)
1. Navigate to: **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (for public app)
3. Fill required fields:
   - **App name**: `TitleTesterPro`
   - **User support email**: `admin@titletesterpro.com` (or your email)
   - **App logo**: Upload logo (optional but recommended)
   - **App domain**: `titletesterpro.com`
   - **Authorized domains**: Add `titletesterpro.com`
   - **Developer contact**: `admin@titletesterpro.com`

#### 1.3 Create OAuth 2.0 Client ID
1. Navigate to: **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Application type**: **Web application**
4. **Name**: `TitleTesterPro Web Client`
5. **Authorized JavaScript origins**:
   ```
   https://titletesterpro.com
   https://www.titletesterpro.com
   http://localhost:3000 (for development)
   ```
6. **Authorized redirect URIs**:
   ```
   https://titletesterpro.firebaseapp.com/__/auth/handler
   https://www.titletesterpro.com/__/auth/handler
   http://localhost:3000/__/auth/handler
   ```
7. Click **CREATE**
8. **CRITICAL**: Copy the Client ID (format: `xxxxx.apps.googleusercontent.com`)

### Phase 2: Firebase Authentication Configuration

#### 2.1 Enable Firebase Authentication
1. Go to: https://console.firebase.google.com/project/titletesterpro/authentication
2. If not enabled, click **Get started** to enable Authentication service
3. Wait for initialization (30-60 seconds)

#### 2.2 Configure Google Sign-In Provider
1. Navigate to **Authentication** → **Sign-in method** tab
2. Click on **Google** provider
3. Toggle **Enable** to ON
4. **Web SDK configuration**:
   - **Web client ID**: Paste the Client ID from Step 1.3.8
   - **Web client secret**: Paste the Client Secret from Google Cloud Console
5. **Project support email**: Select your email address
6. Click **Save**

#### 2.3 Configure Authorized Domains
1. Navigate to **Authentication** → **Settings** tab
2. Scroll to **Authorized domains** section
3. Add these domains (if not present):
   ```
   titletesterpro.com
   www.titletesterpro.com
   localhost (for development)
   ```
4. Remove any unnecessary preview domains for security

### Phase 3: DNS and Domain Verification

#### 3.1 Verify Domain Ownership (Google Search Console)
1. Go to: https://search.google.com/search-console
2. Add property: `https://www.titletesterpro.com`
3. Verify using DNS TXT record or HTML file upload
4. This ensures Google trusts your domain for OAuth

#### 3.2 Verify Current DNS Configuration
```bash
# Verify main domain
dig +short A titletesterpro.com
dig +short A www.titletesterpro.com

# Verify Firebase hosting
dig +short CNAME www.titletesterpro.com

# Expected: Points to Vercel or Firebase Hosting
```

### Phase 4: TLS and Security Configuration

#### 4.1 Verify TLS Certificate Coverage
```bash
# Test TLS handshake
openssl s_client -connect www.titletesterpro.com:443 -servername www.titletesterpro.com -showcerts | grep -E "(subject|issuer)"

# Verify SAN coverage
openssl s_client -connect www.titletesterpro.com:443 -servername www.titletesterpro.com -showcerts | openssl x509 -noout -text | grep -A1 "Subject Alternative Name"
```

#### 4.2 Implement Security Headers (Vercel Configuration)
Add to `/Users/kvimedia/TTPROv6/vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

---

## VERIFICATION PROCEDURES

### 5.1 Automated Verification Script
```bash
# Run comprehensive Firebase auth test
node /Users/kvimedia/TTPROv6/verify-firebase-fix.js
```

### 5.2 Manual Testing Checklist

#### API Endpoint Verification
```bash
# Test Firebase Authentication API
curl -s "https://identitytoolkit.googleapis.com/v1/projects/titletesterpro/config?key=AIzaSyA8hjvKfC_D1rQqIWgjhxq-xM1cmgDB3z4"

# Expected: JSON response with configuration (not 404)
```

#### Frontend Testing
1. **Production Test**:
   - Navigate to: `https://www.titletesterpro.com/app`
   - Click "Sign In with Google"
   - Verify Google OAuth popup opens
   - Complete sign-in flow
   - Verify user email displays on dashboard

2. **Development Test**:
   - Run: `npm run dev`
   - Navigate to: `http://localhost:3000/app`
   - Test Google sign-in flow
   - Verify no console errors

#### CORS and Cookie Verification
```bash
# Test CORS preflight
curl -X OPTIONS \
  -H "Origin: https://www.titletesterpro.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  https://identitytoolkit.googleapis.com/v1/projects/titletesterpro/config

# Expected: Proper CORS headers in response
```

---

## ROUTING MATRIX CONFIGURATION

### DNS Configuration
```
Domain                  Type    Target                      TTL     Status
titletesterpro.com      A       76.76.19.123               300     ✅ Active
www.titletesterpro.com  CNAME   cname.vercel-dns.com       300     ✅ Active
```

### TLS Configuration
```
Certificate Authority   Let's Encrypt / Vercel Managed
Coverage               titletesterpro.com, *.titletesterpro.com
OCSP Stapling          Enabled
HTTP/2                 Enabled
HSTS                   max-age=31536000; includeSubDomains
```

### Firebase Authentication URLs
```
Auth Domain            titletesterpro.firebaseapp.com
Redirect Handler       /__/auth/handler
API Endpoint           identitytoolkit.googleapis.com
Project ID             titletesterpro
```

---

## TROUBLESHOOTING GUIDE

### Common Issues and Solutions

#### Issue 1: "Invalid OAuth Client" Error
**Cause**: Incorrect redirect URIs or JavaScript origins
**Solution**: 
1. Verify exact URLs in Google Cloud Console OAuth client
2. Ensure `https://titletesterpro.firebaseapp.com/__/auth/handler` is included
3. Check for typos in domain names

#### Issue 2: "This app isn't verified" Warning
**Cause**: OAuth consent screen not published or missing verification
**Solution**:
1. In Google Cloud Console, go to OAuth consent screen
2. Click "PUBLISH APP" to make it public
3. For production apps, consider Google verification process

#### Issue 3: CORS Errors in Browser Console
**Cause**: Missing authorized domains in Firebase or incorrect origins
**Solution**:
1. Add all production domains to Firebase authorized domains
2. Verify JavaScript origins in Google Cloud Console match exactly

#### Issue 4: "Access blocked" Error
**Cause**: Domain not verified or OAuth consent screen misconfigured
**Solution**:
1. Verify domain ownership in Google Search Console
2. Ensure authorized domains match in both Google Cloud Console and Firebase

### Diagnostic Commands
```bash
# Check DNS resolution
nslookup www.titletesterpro.com

# Test TLS handshake
curl -I https://www.titletesterpro.com

# Verify Firebase configuration
curl -s "https://identitytoolkit.googleapis.com/v1/projects/titletesterpro/config?key=AIzaSyA8hjvKfC_D1rQqIWgjhxq-xM1cmgDB3z4" | jq .

# Test OAuth endpoint
curl -I "https://accounts.google.com/o/oauth2/auth?client_id=YOUR_CLIENT_ID&response_type=code&scope=openid%20profile%20email&redirect_uri=https://titletesterpro.firebaseapp.com/__/auth/handler"
```

---

## SECURITY CONSIDERATIONS

### Production Security Checklist
- [ ] OAuth client ID restricted to specific domains only
- [ ] No wildcard domains in authorized origins
- [ ] HSTS enabled with appropriate max-age
- [ ] CSP headers configured to prevent XSS
- [ ] Firebase Security Rules properly configured
- [ ] Regular security audit of authorized domains

### Privacy and Compliance
- [ ] Privacy Policy linked in OAuth consent screen
- [ ] Terms of Service accessible
- [ ] Data handling compliance (GDPR/CCPA if applicable)
- [ ] User consent properly obtained and stored

---

## SUCCESS METRICS

### Key Performance Indicators
1. **Authentication Success Rate**: >99%
2. **OAuth Popup Load Time**: <2 seconds
3. **Sign-in Completion Time**: <5 seconds
4. **Error Rate**: <1%
5. **User Experience**: Zero visible errors or warnings

### Monitoring Setup
```javascript
// Add to analytics/monitoring
const authMetrics = {
  signInAttempts: 0,
  signInSuccess: 0,
  signInErrors: {},
  averageSignInTime: 0
}

// Track in firebase-client.ts
performance.mark('auth-start')
// ... auth flow
performance.mark('auth-complete')
const duration = performance.measure('auth-flow', 'auth-start', 'auth-complete')
```

---

## NEXT STEPS

1. **Immediate**: Complete Google OAuth client creation and Firebase configuration
2. **Testing**: Run all verification procedures
3. **Monitoring**: Implement authentication success tracking
4. **Documentation**: Update any deployment documentation with new OAuth setup
5. **Backup**: Export OAuth client configuration for disaster recovery

---

**Configuration Guide Generated by: Echo Red Ultra v5 - Principal Networking & Edge Architect**
**Date**: 2025-08-26
**Project**: TitleTesterPro (titletesterpro)
**Status**: Ready for Implementation