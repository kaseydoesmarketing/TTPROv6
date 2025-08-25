# TitleTesterPro v6 Deployment Configuration

## DEPLOYMENT COMPLETE ✅

**Production URL:** https://titletesterpro.com  
**Alternate URL:** https://www.titletesterpro.com  
**Vercel Dashboard:** https://vercel.com/ttpro-live/titletesterpro-v6  
**Team:** ttpro-live (CORRECT)

## Vercel Deployment

### Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://YOUR-REDIS-INSTANCE.upstash.io
UPSTASH_REDIS_REST_TOKEN=YOUR-REDIS-TOKEN

# Firebase Admin SDK
FIREBASE_PROJECT_ID=titletesterpro
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@titletesterpro.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Google OAuth (YouTube API)
GOOGLE_CLIENT_ID=YOUR-CLIENT-ID
GOOGLE_CLIENT_SECRET=YOUR-CLIENT-SECRET
GOOGLE_REDIRECT_URI=https://YOUR-DOMAIN.vercel.app/api/auth/youtube/callback

# Application
NEXTAUTH_URL=https://YOUR-DOMAIN.vercel.app
NEXTAUTH_SECRET=YOUR-SECRET-KEY
BASE_URL=https://YOUR-DOMAIN.vercel.app

# Cron Job Secret (for Vercel Cron)
CRON_SECRET=YOUR-CRON-SECRET
```

### Vercel Configuration

1. **Import Project from GitHub**
   - Repository: `kaseydoesmarketing/TTPROv6`
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

2. **Configure Cron Jobs**
   - Add to `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/cron/rotate-titles",
       "schedule": "*/5 * * * *"
     }]
   }
   ```

3. **Database Setup**
   - Use Vercel Postgres or external PostgreSQL
   - Run migrations: `npx prisma migrate deploy`

4. **Redis Setup**
   - Create Upstash Redis instance
   - Copy REST URL and token

### Deployment Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add DATABASE_URL production
vercel env add UPSTASH_REDIS_REST_URL production
# ... add all other variables

# Run database migrations
npx prisma migrate deploy
```

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Database migrations completed successfully
- [ ] Redis connection working
- [ ] Firebase authentication functional
- [ ] YouTube OAuth flow working
- [ ] Cron jobs scheduled and running
- [ ] Monitoring and logging enabled