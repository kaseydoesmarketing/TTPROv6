# 🌐 Domain Configuration Guide for TitleTesterPro v6

## Current Status
- **TTPROv6 Deployment**: Successfully deployed to Vercel
- **Deployment URL**: `titletesterpro-v6-7ykt60bk1-ttpro.vercel.app`
- **Target Domains**: 
  - `https://titletesterpro.com`
  - `https://www.titletesterpro.com`
- **Current Live Site**: TTPROv5 (appears to be running on these domains)

## 📋 Configuration Steps

### Option 1: Via Vercel Dashboard (Recommended)

1. **Login to Vercel**
   - Go to https://vercel.com/dashboard
   - Sign in with your account

2. **Navigate to Project**
   - Find `titletesterpro-v6` project
   - Or go directly to: https://vercel.com/team_29SHVFd2BzIFotBTYp6TiY0B/titletesterpro-v6

3. **Add Custom Domains**
   - Click **Settings** → **Domains**
   - Click **Add Domain**
   - Add `titletesterpro.com`
   - Add `www.titletesterpro.com`

4. **Configure DNS**
   
   You'll need to update your DNS records at your domain registrar:

   **For titletesterpro.com (apex domain):**
   ```
   Type: A
   Name: @ (or blank)
   Value: 76.76.21.21
   ```

   **For www.titletesterpro.com:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Option 2: Via Vercel CLI (If Authenticated)

```bash
# Login to Vercel
vercel login

# Navigate to project
cd /Users/kvimedia/TTPROv6

# Add domains to project
vercel domains add titletesterpro.com --yes
vercel domains add www.titletesterpro.com --yes

# Link domains to deployment
vercel alias set titletesterpro-v6-7ykt60bk1-ttpro.vercel.app titletesterpro.com
vercel alias set titletesterpro-v6-7ykt60bk1-ttpro.vercel.app www.titletesterpro.com
```

### Option 3: Using Vercel Nameservers (Simplest)

Instead of configuring individual DNS records, you can point your entire domain to Vercel:

1. **At your domain registrar**, change nameservers to:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`

2. **In Vercel Dashboard**, add the domains as described in Option 1

3. Vercel will automatically handle all DNS configuration

## 🔍 Verification Steps

### 1. Check DNS Propagation
```bash
# Check A records
nslookup titletesterpro.com
# Should show: 76.76.21.21

# Check CNAME
nslookup www.titletesterpro.com
# Should show: cname.vercel-dns.com
```

### 2. Test HTTPS Access
```bash
# Test apex domain
curl -I https://titletesterpro.com
# Should return HTTP/2 200

# Test www subdomain
curl -I https://www.titletesterpro.com
# Should return HTTP/2 200
```

### 3. Verify Content
```bash
# Check that v6 is being served
curl -s https://titletesterpro.com | grep "TitleTesterPro v6"
```

## 🚨 Important Notes

1. **DNS Propagation**: DNS changes can take up to 48 hours to propagate globally, though it's usually much faster (5-30 minutes)

2. **SSL Certificates**: Vercel automatically provisions SSL certificates once DNS is properly configured

3. **Current Deployment**: The domains currently appear to be serving TTPROv5. You'll need to update them to point to v6

4. **Deployment Protection**: Make sure deployment protection is disabled if you want public access

5. **API Proxy**: TTPROv6 is configured to proxy API calls to TTPROv5 backend at `ttprov5.onrender.com`

## 📊 Project Information

- **Project ID**: `prj_4jw491ruQaKiC0VI5oWGXsiQDaVY`
- **Team ID**: `team_29SHVFd2BzIFotBTYp6TiY0B`
- **GitHub Repo**: https://github.com/kaseydoesmarketing/TTPROv6
- **Backend API**: https://ttprov5.onrender.com (proxied)

## 🔧 Troubleshooting

### Domain Not Working?
1. Check DNS propagation status: https://dnschecker.org
2. Verify domain is added in Vercel dashboard
3. Ensure DNS records are correct
4. Wait for SSL certificate provisioning

### Getting 404 Error?
1. Verify deployment is successful
2. Check that domain is linked to correct deployment
3. Ensure build completed without errors

### API Calls Failing?
1. Check `next.config.js` proxy configuration
2. Verify backend at `ttprov5.onrender.com` is healthy
3. Check CORS settings

## 📞 Next Steps

1. **Add domains in Vercel Dashboard** (manual step required)
2. **Update DNS records** at your domain registrar
3. **Wait for propagation** (5-30 minutes typically)
4. **Verify deployment** using the commands above
5. **Test functionality** including API proxy

Once configured, both `https://titletesterpro.com` and `https://www.titletesterpro.com` will serve TTPROv6!