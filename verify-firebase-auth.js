#!/usr/bin/env node

const https = require('https');

console.log('🔍 FIREBASE AUTHENTICATION DIAGNOSTIC\n');
console.log('=====================================\n');

const config = {
  apiKey: 'AIzaSyA8hjvKfC_D1rQqIWgjhxq-xM1cmgDB3z4',
  authDomain: 'titletesterpro.firebaseapp.com',
  projectId: 'titletesterpro'
};

console.log('📋 Configuration:');
console.log('  Project ID:', config.projectId);
console.log('  Auth Domain:', config.authDomain);
console.log('  API Key:', config.apiKey.substring(0, 10) + '...\n');

// Test 1: Check if Identity Toolkit API is enabled
function testIdentityToolkit() {
  return new Promise((resolve) => {
    const url = `https://identitytoolkit.googleapis.com/v1/projects/${config.projectId}/config?key=${config.apiKey}`;
    
    https.get(url, (res) => {
      if (res.statusCode === 404) {
        console.log('❌ Identity Toolkit API: NOT ENABLED');
        console.log('   Fix: Enable Firebase Authentication in console');
        console.log('   Link: https://console.firebase.google.com/project/titletesterpro/authentication\n');
      } else if (res.statusCode === 200) {
        console.log('✅ Identity Toolkit API: ENABLED\n');
      } else {
        console.log(`⚠️  Identity Toolkit API: Status ${res.statusCode}\n`);
      }
      resolve();
    }).on('error', (err) => {
      console.log('❌ Identity Toolkit API: Error -', err.message, '\n');
      resolve();
    });
  });
}

// Test 2: Check OAuth configuration
function testOAuthEndpoint() {
  return new Promise((resolve) => {
    const url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${config.apiKey}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log('✅ OAuth Configuration: FOUND');
            if (json.authorizedDomains) {
              console.log('   Authorized domains:', json.authorizedDomains.join(', '));
            }
          } catch (e) {
            console.log('⚠️  OAuth Configuration: Parse error');
          }
        } else {
          console.log('❌ OAuth Configuration: Not accessible');
        }
        console.log('\n');
        resolve();
      });
    }).on('error', (err) => {
      console.log('❌ OAuth Configuration: Error -', err.message, '\n');
      resolve();
    });
  });
}

// Run all tests
async function runDiagnostics() {
  await testIdentityToolkit();
  await testOAuthEndpoint();
  
  console.log('📝 NEXT STEPS:');
  console.log('1. If Identity Toolkit is not enabled, enable Firebase Authentication');
  console.log('2. Ensure Google provider is enabled with client ID and secret');
  console.log('3. Click "Save" on all configuration dialogs');
  console.log('4. Wait 1-2 minutes for changes to propagate');
  console.log('5. Test again at https://www.titletesterpro.com/app\n');
  
  console.log('🔗 Direct Links:');
  console.log('Firebase Auth: https://console.firebase.google.com/project/titletesterpro/authentication');
  console.log('Google Provider: https://console.firebase.google.com/project/titletesterpro/authentication/providers');
}

runDiagnostics();
