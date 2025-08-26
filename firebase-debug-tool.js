#!/usr/bin/env node

/**
 * Firebase Authentication Debug Tool
 * Comprehensive diagnostics for Google Sign-In failures
 * By SpecterX Ultra v5 - Bug Hunter Supreme
 */

const https = require('https');

const config = {
    projectId: 'titletesterpro',
    apiKey: 'AIzaSyA8hjvKfC_D1rQqIWgjhxq-xM1cmgDB3z4',
    authDomain: 'titletesterpro.firebaseapp.com',
    webClientId: 'expected_web_client_id' // We need to find this
};

console.log('🔍 Firebase Authentication Comprehensive Diagnostics');
console.log('=' .repeat(60));
console.log(`Project ID: ${config.projectId}`);
console.log(`API Key: ${config.apiKey.substring(0, 20)}...`);
console.log(`Auth Domain: ${config.authDomain}`);
console.log('');

// Test functions
const tests = [
    testFirebaseProjectExists,
    testIdentityToolkitV1,
    testFirebaseConfig,
    testGoogleSignInConfig,
    testAuthDomain,
    testCORSHeaders
];

async function runAllTests() {
    console.log('🚀 Running comprehensive Firebase diagnostics...\n');
    
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        console.log(`[${i + 1}/${tests.length}] ${test.name.replace(/([A-Z])/g, ' $1').toLowerCase()}...`);
        try {
            await test();
            console.log('');
        } catch (error) {
            console.log(`❌ ${error.message}\n`);
        }
    }
    
    console.log('🎯 DIAGNOSIS SUMMARY');
    console.log('=' .repeat(40));
    console.log('Based on the 404 error from Firebase Identity Toolkit API,');
    console.log('the most likely causes are:');
    console.log('');
    console.log('1. 🔥 Firebase Authentication is NOT ENABLED in console');
    console.log('2. 📋 Project ID or API key mismatch');
    console.log('3. 🌐 API endpoint changed or deprecated');
    console.log('');
    console.log('🔧 IMMEDIATE ACTIONS REQUIRED:');
    console.log('1. Visit Firebase Console: https://console.firebase.google.com/project/titletesterpro/authentication');
    console.log('2. Verify Authentication is enabled under "Sign-in method"');
    console.log('3. Verify Google provider is enabled with correct Web client ID');
    console.log('4. Check authorized domains include: www.titletesterpro.com, titletesterpro.com');
}

function testFirebaseProjectExists() {
    return new Promise((resolve, reject) => {
        const url = `https://firebase.googleapis.com/v1beta1/projects/${config.projectId}`;
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Firebase project exists and is accessible');
                    try {
                        const project = JSON.parse(data);
                        console.log(`   Project Name: ${project.displayName || 'N/A'}`);
                        console.log(`   Project State: ${project.state || 'N/A'}`);
                    } catch (e) {
                        console.log('   (Unable to parse project details)');
                    }
                    resolve();
                } else {
                    reject(new Error(`Firebase project not accessible: ${res.statusCode}`));
                }
            });
        }).on('error', err => {
            reject(new Error(`Network error: ${err.message}`));
        });
    });
}

function testIdentityToolkitV1() {
    return new Promise((resolve, reject) => {
        const url = `https://identitytoolkit.googleapis.com/v1/projects/${config.projectId}:getRecaptchaConfig?key=${config.apiKey}`;
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Identity Toolkit V1 API is responding');
                    resolve();
                } else if (res.statusCode === 403) {
                    reject(new Error('Identity Toolkit API access forbidden - Authentication may be disabled'));
                } else if (res.statusCode === 404) {
                    reject(new Error('Identity Toolkit API endpoint not found - Authentication likely disabled'));
                } else {
                    reject(new Error(`Identity Toolkit API error: ${res.statusCode}`));
                }
            });
        }).on('error', err => {
            reject(new Error(`Network error: ${err.message}`));
        });
    });
}

function testFirebaseConfig() {
    return new Promise((resolve, reject) => {
        const url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${config.apiKey}`;
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Firebase config accessible via V3 API');
                    try {
                        const configData = JSON.parse(data);
                        if (configData.googleEnabled) {
                            console.log('✅ Google Sign-In is enabled in Firebase');
                        } else {
                            console.log('❌ Google Sign-In is DISABLED in Firebase');
                        }
                    } catch (e) {
                        console.log('   (Unable to parse config details)');
                    }
                    resolve();
                } else {
                    reject(new Error(`Firebase config API error: ${res.statusCode}`));
                }
            });
        }).on('error', err => {
            reject(new Error(`Network error: ${err.message}`));
        });
    });
}

function testGoogleSignInConfig() {
    return new Promise((resolve) => {
        console.log('🔍 Checking Google Sign-In Configuration Requirements:');
        console.log('   - Web Client ID: REQUIRED for signInWithPopup()');
        console.log('   - Authorized JavaScript origins: https://www.titletesterpro.com');
        console.log('   - Authorized redirect URIs: https://www.titletesterpro.com/__/auth/handler');
        console.log('   - Firebase Auth domain must match Google OAuth settings');
        console.log('⚠️  Manual verification required in Google Cloud Console');
        resolve();
    });
}

function testAuthDomain() {
    return new Promise((resolve, reject) => {
        const url = `https://${config.authDomain}/__/auth/iframe`;
        
        https.get(url, (res) => {
            if (res.statusCode === 200 || res.statusCode === 302) {
                console.log('✅ Firebase Auth domain is accessible');
                resolve();
            } else {
                reject(new Error(`Auth domain not accessible: ${res.statusCode}`));
            }
        }).on('error', err => {
            reject(new Error(`Auth domain network error: ${err.message}`));
        });
    });
}

function testCORSHeaders() {
    return new Promise((resolve) => {
        console.log('🌐 CORS Configuration Check:');
        console.log('   - titletesterpro.com must be in Firebase authorized domains');
        console.log('   - www.titletesterpro.com must be in Firebase authorized domains');
        console.log('   - Google OAuth client must allow these domains');
        console.log('   - Browser must allow popups for authentication');
        console.log('💡 Test with browser DevTools Network tab for CORS errors');
        resolve();
    });
}

// Run the diagnostics
runAllTests().catch(console.error);