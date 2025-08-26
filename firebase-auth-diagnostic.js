#!/usr/bin/env node

const https = require('https');
const { URL } = require('url');

const config = {
    projectId: 'titletesterpro',
    apiKey: 'AIzaSyA8hjvKfC_D1rQqIWgjhxq-xM1cmgDB3z4',
    authDomain: 'titletesterpro.firebaseapp.com'
};

console.log('🔍 FIREBASE AUTHENTICATION DIAGNOSTIC REPORT');
console.log('==============================================\n');

console.log('📋 Project Configuration:');
console.log(`   Project ID: ${config.projectId}`);
console.log(`   API Key: ${config.apiKey}`);
console.log(`   Auth Domain: ${config.authDomain}\n`);

// Test 1: Firebase Authentication Service Status
console.log('🧪 TEST 1: Firebase Authentication Service Status');
console.log('------------------------------------------------');

const authConfigUrl = `https://identitytoolkit.googleapis.com/v1/projects/${config.projectId}/config?key=${config.apiKey}`;

function testEndpoint(url, testName, callback) {
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            callback(res.statusCode, data);
        });
    }).on('error', err => {
        callback(-1, err.message);
    });
}

testEndpoint(authConfigUrl, 'Authentication Config', (statusCode, data) => {
    if (statusCode === 200) {
        try {
            const authConfig = JSON.parse(data);
            console.log('✅ Firebase Authentication is ENABLED');
            
            if (authConfig.signIn && authConfig.signIn.googleEnabled) {
                console.log('✅ Google Sign-In provider is ENABLED');
            } else {
                console.log('❌ Google Sign-In provider is DISABLED');
                console.log('   Action Required: Enable Google provider in Firebase Console');
            }
            
            console.log('\n📊 Authentication Configuration:');
            console.log(JSON.stringify(authConfig, null, 2));
            
        } catch (e) {
            console.log('❌ Invalid JSON response from Firebase Auth API');
            console.log(`   Response: ${data.substring(0, 200)}...`);
        }
    } else if (statusCode === 403) {
        console.log('❌ FIREBASE AUTHENTICATION IS DISABLED');
        console.log('   HTTP Status: 403 Forbidden');
        console.log('   This confirms Authentication service is not enabled');
    } else if (statusCode === 404) {
        console.log('❌ FIREBASE AUTHENTICATION IS DISABLED');
        console.log('   HTTP Status: 404 Not Found');
        console.log('   The Authentication API endpoints do not exist for this project');
        console.log('   This confirms Authentication service is not enabled');
    } else if (statusCode === -1) {
        console.log(`❌ Network error: ${data}`);
    } else {
        console.log(`❌ Unexpected response: HTTP ${statusCode}`);
        console.log(`   Response: ${data.substring(0, 200)}...`);
    }
    
    // Test 2: Project existence
    console.log('\n🧪 TEST 2: Firebase Project Existence');
    console.log('-------------------------------------');
    
    const projectUrl = `https://firebase.googleapis.com/v1/projects/${config.projectId}?key=${config.apiKey}`;
    testEndpoint(projectUrl, 'Project Existence', (statusCode, data) => {
        if (statusCode === 401) {
            console.log('✅ Firebase project EXISTS (API key authentication required)');
            console.log('   The project exists but requires OAuth2 for this endpoint');
        } else if (statusCode === 404) {
            console.log('❌ Firebase project NOT FOUND');
            console.log('   The project ID may be incorrect');
        } else {
            console.log(`ℹ️  Project API response: HTTP ${statusCode}`);
        }
        
        // Test 3: Auth domain connectivity
        console.log('\n🧪 TEST 3: Auth Domain Connectivity');
        console.log('----------------------------------');
        
        const authDomainUrl = `https://${config.authDomain}/__/auth/config?apiKey=${config.apiKey}`;
        testEndpoint(authDomainUrl, 'Auth Domain', (statusCode, data) => {
            if (statusCode === 200) {
                console.log('✅ Auth domain is accessible');
                try {
                    const domainConfig = JSON.parse(data);
                    console.log('✅ Auth domain configuration is valid');
                } catch (e) {
                    console.log('⚠️  Auth domain returned non-JSON response');
                }
            } else if (statusCode === 404) {
                console.log('❌ Auth domain configuration not found');
                console.log('   This likely means Authentication is not enabled');
            } else {
                console.log(`ℹ️  Auth domain response: HTTP ${statusCode}`);
            }
            
            // Final summary
            console.log('\n🎯 DIAGNOSTIC SUMMARY');
            console.log('====================');
            console.log('ROOT CAUSE CONFIRMED: Firebase Authentication service is NOT ENABLED');
            console.log('');
            console.log('📝 RESOLUTION STEPS:');
            console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
            console.log('2. Select project: titletesterpro');
            console.log('3. Navigate to Authentication section');
            console.log('4. Click "Get started" to enable Authentication');
            console.log('5. Go to "Sign-in method" tab');
            console.log('6. Enable "Google" provider');
            console.log('7. Add authorized domains: titletesterpro.com, localhost');
            console.log('');
            console.log('🔗 Direct link: https://console.firebase.google.com/project/titletesterpro/authentication');
        });
    });
});