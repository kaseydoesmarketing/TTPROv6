# FIREBASE CONSOLE DIRECT LINKS

**Quick Access to Firebase Configuration**

## Primary Firebase Console Links

### Authentication Configuration
- **Main Authentication Dashboard**: https://console.firebase.google.com/project/titletesterpro/authentication
- **Sign-in Methods**: https://console.firebase.google.com/project/titletesterpro/authentication/providers
- **Users Tab**: https://console.firebase.google.com/project/titletesterpro/authentication/users
- **Settings**: https://console.firebase.google.com/project/titletesterpro/authentication/settings

### Google Cloud Console Links
- **OAuth Credentials**: https://console.cloud.google.com/apis/credentials?project=titletesterpro
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent?project=titletesterpro
- **API Library**: https://console.cloud.google.com/apis/library?project=titletesterpro

## CRITICAL ACTIONS NEEDED

### 1. ENABLE FIREBASE AUTHENTICATION
**URL**: https://console.firebase.google.com/project/titletesterpro/authentication
**Action**: Click "Get started" button to enable Authentication service

### 2. CONFIGURE GOOGLE SIGN-IN PROVIDER
**URL**: https://console.firebase.google.com/project/titletesterpro/authentication/providers
**Action**: 
1. Click on "Google" provider
2. Toggle "Enable" to ON
3. Add Web Client ID (from Google Cloud Console)
4. Set project support email
5. Click "Save"

### 3. SET UP AUTHORIZED DOMAINS
**URL**: https://console.firebase.google.com/project/titletesterpro/authentication/settings
**Action**: Add domains:
- `titletesterpro.com`
- `www.titletesterpro.com`
- `localhost` (for development)

### 4. CREATE GOOGLE OAUTH CLIENT
**URL**: https://console.cloud.google.com/apis/credentials?project=titletesterpro
**Action**: 
1. Click "CREATE CREDENTIALS" → "OAuth client ID"
2. Select "Web application"
3. Add authorized origins and redirect URIs
4. Copy Client ID to Firebase

## Current Project Configuration

**Project ID**: `titletesterpro`
**Firebase App ID**: `1:564429395545:web:c5e53dec47b0aa74f23fa0`
**API Key**: `AIzaSyA8hjvKfC_D1rQqIWgjhxq-xM1cmgDB3z4`

## Verification Commands

After completing the setup:

```bash
# Test Firebase Authentication API
curl -s "https://identitytoolkit.googleapis.com/v1/projects/titletesterpro/config?key=AIzaSyA8hjvKfC_D1rQqIWgjhxq-xM1cmgDB3z4"

# Run full verification
node /Users/kvimedia/TTPROv6/verify-oauth-setup.js
```

## Security Headers Configuration

Add to `/Users/kvimedia/TTPROv6/vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```