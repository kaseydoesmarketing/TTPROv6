#!/usr/bin/env node

const https = require('https');

const config = {
    projectId: 'titletesterpro',
    apiKey: 'AIzaSyA8hjvKfC_D1rQqIWgjhxq-xM1cmgDB3z4',
    authDomain: 'titletesterpro.firebaseapp.com'
};

console.log('🔬 FIREBASE AUTHENTICATION VERIFICATION');
console.log('=======================================\n');

function testAuthConfig() {
    return new Promise((resolve, reject) => {
        const authUrl = `https://identitytoolkit.googleapis.com/v1/projects/${config.projectId}/config?key=${config.apiKey}`;
        
        https.get(authUrl, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, data });
            });
        }).on('error', err => {
            reject(err);
        });
    });
}

function testAuthDomain() {
    return new Promise((resolve, reject) => {
        const domainUrl = `https://${config.authDomain}/__/auth/config?apiKey=${config.apiKey}`;
        
        https.get(domainUrl, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, data });
            });
        }).on('error', err => {
            reject(err);
        });
    });
}

async function runVerification() {
    let allPassed = true;
    
    console.log('✅ Testing Firebase Authentication API...');
    try {
        const authResult = await testAuthConfig();
        
        if (authResult.statusCode === 200) {
            const authConfig = JSON.parse(authResult.data);
            console.log('✅ Firebase Authentication is ENABLED');
            
            // Check Google provider
            if (authConfig.signIn && authConfig.signIn.googleEnabled) {
                console.log('✅ Google Sign-In provider is ENABLED');
            } else {
                console.log('❌ Google Sign-In provider is DISABLED');
                console.log('   Still need to enable Google provider in Firebase Console');
                allPassed = false;
            }
            
            // Check authorized domains
            if (authConfig.authorizedDomains) {
                const requiredDomains = ['titletesterpro.com', 'localhost'];
                const authorizedDomains = authConfig.authorizedDomains;
                
                console.log('🔗 Authorized domains:');
                authorizedDomains.forEach(domain => {
                    console.log(`   - ${domain}`);
                });
                
                const missingDomains = requiredDomains.filter(domain => 
                    !authorizedDomains.includes(domain)
                );
                
                if (missingDomains.length === 0) {
                    console.log('✅ All required domains are authorized');
                } else {
                    console.log('⚠️  Missing authorized domains:', missingDomains.join(', '));
                    console.log('   Add these domains in Firebase Console > Authentication > Settings');
                }
            }
            
        } else if (authResult.statusCode === 404) {
            console.log('❌ Firebase Authentication is still DISABLED');
            console.log('   Please enable Authentication in Firebase Console first');
            allPassed = false;
        } else {
            console.log(`❌ Unexpected response: HTTP ${authResult.statusCode}`);
            allPassed = false;
        }
        
    } catch (error) {
        console.log('❌ Error testing Authentication API:', error.message);
        allPassed = false;
    }
    
    console.log('\n✅ Testing Auth Domain connectivity...');
    try {
        const domainResult = await testAuthDomain();
        
        if (domainResult.statusCode === 200) {
            console.log('✅ Auth domain is properly configured');
        } else {
            console.log(`⚠️  Auth domain response: HTTP ${domainResult.statusCode}`);
        }
        
    } catch (error) {
        console.log('❌ Error testing Auth Domain:', error.message);
    }
    
    // Final result
    console.log('\n🎯 VERIFICATION RESULT');
    console.log('======================');
    
    if (allPassed) {
        console.log('🎉 SUCCESS! Firebase Authentication is properly configured');
        console.log('🚀 TitleTesterPro authentication should now work at: https://titletesterpro.com/app');
        console.log('');
        console.log('🧪 Next steps:');
        console.log('1. Test login at https://titletesterpro.com/app');
        console.log('2. Check browser console for any remaining errors');
        console.log('3. Verify user data is properly stored');
    } else {
        console.log('⚠️  Firebase Authentication needs additional configuration');
        console.log('   Please complete the missing steps above');
    }
}

runVerification().catch(console.error);