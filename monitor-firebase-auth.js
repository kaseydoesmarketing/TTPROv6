#!/usr/bin/env node

/**
 * Firebase Authentication Status Monitor
 * Continuously checks if Firebase Auth is enabled and configured
 */

const https = require('https');

const CONFIG = {
  apiKey: 'AIzaSyA8hjvKfC_D1rQqIWgjhxq-xM1cmgDB3z4',
  authDomain: 'titletesterpro.firebaseapp.com',
  projectId: 'titletesterpro'
};

let checkCount = 0;
let lastStatus = null;

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function clearLine() {
  process.stdout.write('\r\x1b[K');
}

function timestamp() {
  return new Date().toLocaleTimeString();
}

async function checkAuthStatus() {
  return new Promise((resolve) => {
    const url = `https://identitytoolkit.googleapis.com/v1/projects/${CONFIG.projectId}/config?key=${CONFIG.apiKey}`;
    
    https.get(url, (res) => {
      if (res.statusCode === 404) {
        resolve({ enabled: false, status: 'NOT_ENABLED' });
      } else if (res.statusCode === 200) {
        resolve({ enabled: true, status: 'ENABLED' });
      } else {
        resolve({ enabled: false, status: `ERROR_${res.statusCode}` });
      }
    }).on('error', (err) => {
      resolve({ enabled: false, status: 'NETWORK_ERROR' });
    });
  });
}

async function checkOAuthConfig() {
  return new Promise((resolve) => {
    const url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${CONFIG.apiKey}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            const hasGoogle = json.idpConfig?.some(idp => idp.provider === 'google.com');
            resolve({ 
              configured: true, 
              hasGoogle,
              domains: json.authorizedDomains || []
            });
          } catch (e) {
            resolve({ configured: false });
          }
        } else {
          resolve({ configured: false });
        }
      });
    }).on('error', () => {
      resolve({ configured: false });
    });
  });
}

async function runCheck() {
  checkCount++;
  clearLine();
  process.stdout.write(`${colors.blue}[${timestamp()}]${colors.reset} Checking... (Check #${checkCount})`);
  
  const authStatus = await checkAuthStatus();
  const oauthConfig = await checkOAuthConfig();
  
  const currentStatus = {
    auth: authStatus.enabled,
    oauth: oauthConfig.configured,
    google: oauthConfig.hasGoogle,
    domains: oauthConfig.domains
  };
  
  // Check if status changed
  const statusChanged = JSON.stringify(currentStatus) !== JSON.stringify(lastStatus);
  
  if (statusChanged || checkCount === 1) {
    console.log('\n');
    console.log('=' .repeat(60));
    console.log(`${colors.bright}FIREBASE AUTHENTICATION STATUS${colors.reset}`);
    console.log('=' .repeat(60));
    
    // Authentication API
    if (authStatus.enabled) {
      console.log(`${colors.green}✅ Authentication API: ENABLED${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Authentication API: NOT ENABLED${colors.reset}`);
      console.log(`   ${colors.yellow}→ Enable at: https://console.firebase.google.com/project/titletesterpro/authentication${colors.reset}`);
    }
    
    // OAuth Configuration
    if (oauthConfig.configured) {
      console.log(`${colors.green}✅ OAuth Configuration: FOUND${colors.reset}`);
      
      if (oauthConfig.hasGoogle) {
        console.log(`${colors.green}✅ Google Provider: CONFIGURED${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ Google Provider: NOT CONFIGURED${colors.reset}`);
        console.log(`   ${colors.yellow}→ Enable at: https://console.firebase.google.com/project/titletesterpro/authentication/providers${colors.reset}`);
      }
      
      if (oauthConfig.domains?.length > 0) {
        console.log(`${colors.blue}📋 Authorized Domains:${colors.reset}`);
        oauthConfig.domains.forEach(domain => {
          console.log(`   • ${domain}`);
        });
      }
    } else {
      console.log(`${colors.red}❌ OAuth Configuration: NOT ACCESSIBLE${colors.reset}`);
    }
    
    console.log('=' .repeat(60));
    
    // Success message
    if (authStatus.enabled && oauthConfig.configured && oauthConfig.hasGoogle) {
      console.log(`\n${colors.green}${colors.bright}🎉 FIREBASE AUTH IS FULLY CONFIGURED!${colors.reset}`);
      console.log(`${colors.green}You can now test sign-in at: https://www.titletesterpro.com/app${colors.reset}\n`);
      console.log('Monitoring stopped. Authentication is ready!');
      process.exit(0);
    } else {
      console.log(`\n${colors.yellow}⏳ Waiting for configuration...${colors.reset}`);
      console.log('This monitor will automatically detect when auth is enabled.\n');
    }
    
    lastStatus = currentStatus;
  }
}

// Main monitoring loop
async function monitor() {
  console.log(`${colors.bright}🔍 FIREBASE AUTHENTICATION MONITOR${colors.reset}`);
  console.log(`Project: ${CONFIG.projectId}`);
  console.log(`Checking every 5 seconds...\n`);
  
  // Initial check
  await runCheck();
  
  // Continue monitoring
  setInterval(runCheck, 5000);
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(`\n\n${colors.yellow}Monitor stopped by user.${colors.reset}`);
  process.exit(0);
});

// Start monitoring
monitor();