# Configure Custom Domains for TitleTesterPro v6

## Manual Configuration Steps

Since automated domain configuration requires valid Vercel authentication, please follow these manual steps to configure the domains:

### 1. Access Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Sign in with your account
3. Navigate to the `titletesterpro-v6` project

### 2. Add Custom Domains
1. Click on the **Settings** tab
2. Select **Domains** from the left sidebar
3. Click **Add Domain**
4. Add the following domains one by one:
   - `titletesterpro.com`
   - `www.titletesterpro.com`

### 3. DNS Configuration

After adding the domains in Vercel, you'll need to configure your DNS records:

#### For titletesterpro.com (apex domain):
```
Type: A
Name: @
Value: 76.76.21.21
```

#### For www.titletesterpro.com:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4. Current DNS Status
Current DNS records show:
- titletesterpro.com → 216.150.1.1, 216.150.1.193
- www.titletesterpro.com → 216.150.16.129, 216.150.16.193

These need to be updated to point to Vercel's servers.

### 5. Alternative Configuration (if using Vercel DNS)
If you want to use Vercel's nameservers instead:
1. Update your domain registrar's nameservers to:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`

### 6. SSL Configuration
Vercel automatically provisions SSL certificates once the domain is properly configured and DNS propagation is complete.

### 7. Verification
After DNS propagation (can take up to 48 hours, usually faster):
1. Visit https://titletesterpro.com
2. Visit https://www.titletesterpro.com
3. Both should load the TTPROv6 application

## Project Details
- **Project ID**: prj_4jw491ruQaKiC0VI5oWGXsiQDaVY
- **Team ID**: team_29SHVFd2BzIFotBTYp6TiY0B
- **Current Deployment**: https://titletesterpro-v6-7ykt60bk1-ttpro.vercel.app

## Command Line Alternative (if you have valid authentication)
```bash
# Login to Vercel
vercel login

# Add domains
vercel domains add titletesterpro.com
vercel domains add www.titletesterpro.com

# Link domains to project
vercel alias set titletesterpro-v6.vercel.app titletesterpro.com
vercel alias set titletesterpro-v6.vercel.app www.titletesterpro.com
```

## Status Check Commands
```bash
# Check DNS propagation
nslookup titletesterpro.com
nslookup www.titletesterpro.com

# Test HTTPS connectivity
curl -I https://titletesterpro.com
curl -I https://www.titletesterpro.com
```