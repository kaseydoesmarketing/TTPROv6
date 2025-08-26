# OAuth Callback URLs for Google Cloud Console

## Required Callback URLs for Google OAuth 2.0

Add these URLs to your Google Cloud Console OAuth 2.0 client configuration:

### Authorized JavaScript origins:
```
https://www.titletesterpro.com
https://titletesterpro.com
```

### Authorized redirect URIs:
```
https://www.titletesterpro.com/__/auth/handler
https://titletesterpro.com/__/auth/handler
```

## How to Add:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 client ID
3. Add the URLs above to the respective sections
4. Click "Save"

## Firebase Configuration:

These URLs are automatically configured in Firebase when you use the Firebase SDK, but you need to explicitly add them to your Google Cloud OAuth client for production use.