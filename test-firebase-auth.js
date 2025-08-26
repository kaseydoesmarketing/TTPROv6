#!/usr/bin/env node

const https = require('https');

const config = {
    projectId: 'titletesterpro',
    apiKey: 'AIzaSyA8hjvKfC_D1rQqIWgjhxq-xM1cmgDB3z4',
    authDomain: 'titletesterpro.firebaseapp.com'
};

console.log('🔥 Testing Firebase Authentication Configuration...\n');

// Test Firebase Auth endpoint
const authUrl = `https://identitytoolkit.googleapis.com/v1/projects/${config.projectId}/config?key=${config.apiKey}`;

https.get(authUrl, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            try {
                const authConfig = JSON.parse(data);
                console.log('✅ Firebase Authentication is ENABLED');
                
                if (authConfig.signIn && authConfig.signIn.googleEnabled) {
                    console.log('✅ Google Sign-In provider is ENABLED');
                    console.log('✅ TitleTesterPro authentication should work!');
                    console.log('\n🚀 Test the flow at: https://titletesterpro.com/app');
                } else {
                    console.log('❌ Google Sign-In provider is DISABLED');
                    console.log('📝 Enable Google provider in Firebase Console');
                }
                
                console.log('\n📊 Auth Configuration:');
                console.log(JSON.stringify(authConfig, null, 2));
                
            } catch (e) {
                console.log('❌ Invalid response from Firebase Auth');
                console.log('Response:', data);
            }
        } else if (res.statusCode === 403) {
            console.log('❌ Firebase Authentication is DISABLED');
            console.log('📝 Enable Authentication in Firebase Console');
            console.log('🔗 https://console.firebase.google.com/project/titletesterpro/authentication');
        } else {
            console.log(`❌ Unexpected response: ${res.statusCode}`);
            console.log('Response:', data);
        }
    });
}).on('error', err => {
    console.log('❌ Network error:', err.message);
});