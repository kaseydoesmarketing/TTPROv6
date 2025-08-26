#!/usr/bin/env node

/**
 * Firebase Authentication Fix Verification
 * Test script to verify Firebase Auth is working after configuration
 */

const https = require('https');

const config = {
    projectId: 'titletesterpro',
    apiKey: 'AIzaSyA8hjvKfC_D1rQqIWgjhxq-xM1cmgDB3z4'
};

console.log('🔥 Testing Firebase Authentication Fix...\n');

// Test the corrected Identity Toolkit endpoint
const testUrl = `https://identitytoolkit.googleapis.com/v1/projects/${config.projectId}:getRecaptchaConfig?key=${config.apiKey}`;

https.get(testUrl, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
            console.log('✅ SUCCESS: Firebase Authentication is now working!');
            console.log('🎉 Google Sign-In should now function correctly');
            console.log('\n🔗 Test at: https://www.titletesterpro.com');
        } else if (res.statusCode === 403) {
            console.log('❌ STILL FAILING: Authentication not enabled in Firebase Console');
            console.log('📝 Action: Enable Authentication in Firebase Console');
        } else if (res.statusCode === 404) {
            console.log('❌ STILL FAILING: Identity Toolkit API not found');
            console.log('📝 Action: Check project configuration');
        } else {
            console.log(`❌ UNEXPECTED ERROR: ${res.statusCode}`);
            console.log('Response:', data.substring(0, 200));
        }
    });
}).on('error', err => {
    console.log('❌ Network error:', err.message);
});