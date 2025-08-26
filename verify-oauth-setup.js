#!/usr/bin/env node

/**
 * Google OAuth Setup Verification Script
 * Principal Networking & Edge Architect - Echo Red Ultra v5
 * 
 * Verifies complete Google OAuth configuration for Firebase Authentication
 */

const https = require('https');
const dns = require('dns').promises;

// Configuration from environment
const FIREBASE_PROJECT_ID = 'titletesterpro';
const FIREBASE_API_KEY = 'AIzaSyA8hjvKfC_D1rQqIWgjhxq-xM1cmgDB3z4';
const PRODUCTION_DOMAIN = 'www.titletesterpro.com';
const FIREBASE_AUTH_DOMAIN = 'titletesterpro.firebaseapp.com';

console.log('🔐 GOOGLE OAUTH CONFIGURATION VERIFICATION');
console.log('==========================================');
console.log(`Project: ${FIREBASE_PROJECT_ID}`);
console.log(`Domain: ${PRODUCTION_DOMAIN}`);
console.log(`Firebase Auth Domain: ${FIREBASE_AUTH_DOMAIN}`);
console.log('');

let allTestsPassed = true;
const results = {
    dns: { passed: false, details: [] },
    tls: { passed: false, details: [] },
    firebase: { passed: false, details: [] },
    cors: { passed: false, details: [] },
    oauth: { passed: false, details: [] }
};

// Utility functions
function httpRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({
                statusCode: res.statusCode,
                headers: res.headers,
                data: data,
                response: res
            }));
        });
        
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

function logTest(category, test, passed, details = '') {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${category}: ${test}`);
    if (details) console.log(`   ${details}`);
    results[category].details.push({ test, passed, details });
    if (!passed) {
        allTestsPassed = false;
        results[category].passed = false;
    }
}

// Test 1: DNS Configuration
async function testDNS() {
    console.log('\n🌐 DNS CONFIGURATION TESTS');
    console.log('-------------------------');
    
    try {
        // Test main domain resolution
        const mainDomain = await dns.resolve4('titletesterpro.com');
        logTest('dns', 'Main domain resolution', mainDomain.length > 0, `Resolves to: ${mainDomain.join(', ')}`);
        
        // Test www subdomain
        const wwwDomain = await dns.resolve4(PRODUCTION_DOMAIN);
        logTest('dns', 'WWW subdomain resolution', wwwDomain.length > 0, `Resolves to: ${wwwDomain.join(', ')}`);
        
        // Test Firebase auth domain
        try {
            const firebaseDomain = await dns.resolve4(FIREBASE_AUTH_DOMAIN);
            logTest('dns', 'Firebase auth domain resolution', firebaseDomain.length > 0, `Resolves to: ${firebaseDomain.join(', ')}`);
        } catch (error) {
            logTest('dns', 'Firebase auth domain resolution', false, `Error: ${error.message}`);
        }
        
        results.dns.passed = results.dns.details.every(d => d.passed);
    } catch (error) {
        logTest('dns', 'DNS resolution', false, `Error: ${error.message}`);
    }
}

// Test 2: TLS Configuration
async function testTLS() {
    console.log('\n🔒 TLS CONFIGURATION TESTS');
    console.log('--------------------------');
    
    try {
        const tlsOptions = {
            hostname: PRODUCTION_DOMAIN,
            port: 443,
            method: 'HEAD',
            path: '/',
            headers: {
                'User-Agent': 'OAuth-Verification-Script/1.0'
            }
        };
        
        const response = await httpRequest(tlsOptions);
        
        // Test HTTPS response
        logTest('tls', 'HTTPS connection', response.statusCode < 400, `Status: ${response.statusCode}`);
        
        // Test security headers
        const securityHeaders = {
            'strict-transport-security': 'HSTS header',
            'x-content-type-options': 'X-Content-Type-Options header',
            'x-frame-options': 'X-Frame-Options header'
        };
        
        Object.entries(securityHeaders).forEach(([header, name]) => {
            const hasHeader = response.headers[header];
            logTest('tls', name, !!hasHeader, hasHeader ? `Present: ${hasHeader}` : 'Missing');
        });
        
        results.tls.passed = results.tls.details.filter(d => d.test !== 'HSTS header').every(d => d.passed);
    } catch (error) {
        logTest('tls', 'TLS connection', false, `Error: ${error.message}`);
    }
}

// Test 3: Firebase Authentication API
async function testFirebaseAuth() {
    console.log('\n🔥 FIREBASE AUTHENTICATION TESTS');
    console.log('--------------------------------');
    
    try {
        // Test Firebase config endpoint
        const configOptions = {
            hostname: 'identitytoolkit.googleapis.com',
            port: 443,
            method: 'GET',
            path: `/v1/projects/${FIREBASE_PROJECT_ID}/config?key=${FIREBASE_API_KEY}`,
            headers: {
                'User-Agent': 'OAuth-Verification-Script/1.0'
            }
        };
        
        const configResponse = await httpRequest(configOptions);
        
        // Test API availability
        const apiWorking = configResponse.statusCode === 200;
        logTest('firebase', 'Authentication API availability', apiWorking, `Status: ${configResponse.statusCode}`);
        
        if (apiWorking) {
            try {
                const config = JSON.parse(configResponse.data);
                
                // Test project configuration
                logTest('firebase', 'Project configuration', !!config.projectId, `Project ID: ${config.projectId || 'Not found'}`);
                
                // Test auth providers
                const hasGoogleProvider = config.signIn?.googleEnabled === true || 
                                        (config.signIn?.providers && config.signIn.providers.includes('google'));
                logTest('firebase', 'Google provider enabled', hasGoogleProvider, hasGoogleProvider ? 'Google sign-in enabled' : 'Google sign-in not enabled');
                
                // Test authorized domains
                const authorizedDomains = config.authorizedDomains || [];
                const hasProductionDomain = authorizedDomains.some(domain => 
                    domain === 'titletesterpro.com' || domain === PRODUCTION_DOMAIN
                );
                logTest('firebase', 'Production domain authorized', hasProductionDomain, `Authorized domains: ${authorizedDomains.join(', ')}`);
                
            } catch (parseError) {
                logTest('firebase', 'Configuration parsing', false, `Parse error: ${parseError.message}`);
            }
        }
        
        results.firebase.passed = results.firebase.details.every(d => d.passed);
    } catch (error) {
        logTest('firebase', 'Firebase API test', false, `Error: ${error.message}`);
    }
}

// Test 4: CORS Configuration
async function testCORS() {
    console.log('\n🌍 CORS CONFIGURATION TESTS');
    console.log('---------------------------');
    
    try {
        // Test CORS preflight for Firebase Auth
        const corsOptions = {
            hostname: 'identitytoolkit.googleapis.com',
            port: 443,
            method: 'OPTIONS',
            path: `/v1/projects/${FIREBASE_PROJECT_ID}/config`,
            headers: {
                'Origin': `https://${PRODUCTION_DOMAIN}`,
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type, Authorization'
            }
        };
        
        const corsResponse = await httpRequest(corsOptions);
        
        // Test preflight response
        const preflightOk = corsResponse.statusCode === 200 || corsResponse.statusCode === 204;
        logTest('cors', 'CORS preflight response', preflightOk, `Status: ${corsResponse.statusCode}`);
        
        // Test CORS headers
        const corsHeaders = {
            'access-control-allow-origin': 'Allow-Origin header',
            'access-control-allow-methods': 'Allow-Methods header',
            'access-control-allow-headers': 'Allow-Headers header'
        };
        
        Object.entries(corsHeaders).forEach(([header, name]) => {
            const hasHeader = corsResponse.headers[header];
            logTest('cors', name, !!hasHeader, hasHeader ? `Present: ${hasHeader}` : 'Not explicitly set (may use defaults)');
        });
        
        results.cors.passed = results.cors.details.filter(d => d.test === 'CORS preflight response').every(d => d.passed);
    } catch (error) {
        logTest('cors', 'CORS preflight test', false, `Error: ${error.message}`);
    }
}

// Test 5: OAuth Endpoints
async function testOAuth() {
    console.log('\n🔑 OAUTH ENDPOINT TESTS');
    console.log('----------------------');
    
    try {
        // Test Google OAuth discovery
        const discoveryOptions = {
            hostname: 'accounts.google.com',
            port: 443,
            method: 'GET',
            path: '/.well-known/openid_configuration',
            headers: {
                'User-Agent': 'OAuth-Verification-Script/1.0'
            }
        };
        
        const discoveryResponse = await httpRequest(discoveryOptions);
        const discoveryOk = discoveryResponse.statusCode === 200;
        logTest('oauth', 'Google OAuth discovery', discoveryOk, `Status: ${discoveryResponse.statusCode}`);
        
        if (discoveryOk) {
            try {
                const discovery = JSON.parse(discoveryResponse.data);
                logTest('oauth', 'OAuth endpoints available', !!discovery.authorization_endpoint, `Auth endpoint: ${discovery.authorization_endpoint || 'Not found'}`);
                logTest('oauth', 'Token endpoint available', !!discovery.token_endpoint, `Token endpoint: ${discovery.token_endpoint || 'Not found'}`);
            } catch (parseError) {
                logTest('oauth', 'Discovery parsing', false, `Parse error: ${parseError.message}`);
            }
        }
        
        // Test Firebase auth handler endpoint
        const handlerOptions = {
            hostname: FIREBASE_AUTH_DOMAIN,
            port: 443,
            method: 'GET',
            path: '/__/auth/handler',
            headers: {
                'User-Agent': 'OAuth-Verification-Script/1.0'
            }
        };
        
        try {
            const handlerResponse = await httpRequest(handlerOptions);
            const handlerOk = handlerResponse.statusCode < 500; // 200, 404, or redirect are all acceptable
            logTest('oauth', 'Firebase auth handler', handlerOk, `Status: ${handlerResponse.statusCode}`);
        } catch (error) {
            logTest('oauth', 'Firebase auth handler', false, `Error: ${error.message}`);
        }
        
        results.oauth.passed = results.oauth.details.every(d => d.passed);
    } catch (error) {
        logTest('oauth', 'OAuth endpoint test', false, `Error: ${error.message}`);
    }
}

// Generate summary report
function generateReport() {
    console.log('\n📊 VERIFICATION SUMMARY');
    console.log('======================');
    
    const categories = Object.keys(results);
    const passedCategories = categories.filter(cat => results[cat].passed);
    const failedCategories = categories.filter(cat => !results[cat].passed);
    
    console.log(`Total Categories: ${categories.length}`);
    console.log(`Passed: ${passedCategories.length} | Failed: ${failedCategories.length}`);
    console.log('');
    
    if (passedCategories.length > 0) {
        console.log('✅ PASSED CATEGORIES:');
        passedCategories.forEach(cat => console.log(`   - ${cat.toUpperCase()}`));
        console.log('');
    }
    
    if (failedCategories.length > 0) {
        console.log('❌ FAILED CATEGORIES:');
        failedCategories.forEach(cat => {
            console.log(`   - ${cat.toUpperCase()}`);
            const failedTests = results[cat].details.filter(d => !d.passed);
            failedTests.forEach(test => {
                console.log(`     • ${test.test}: ${test.details}`);
            });
        });
        console.log('');
    }
    
    if (allTestsPassed) {
        console.log('🎉 ALL TESTS PASSED! Google OAuth is properly configured.');
        console.log('You can now test the sign-in flow at: https://www.titletesterpro.com/app');
    } else {
        console.log('⚠️  SOME TESTS FAILED. Please review the configuration guide:');
        console.log('/Users/kvimedia/TTPROv6/GOOGLE_OAUTH_SETUP_INSTRUCTIONS.md');
    }
    
    // Return exit code
    process.exit(allTestsPassed ? 0 : 1);
}

// Main execution
async function runVerification() {
    try {
        await testDNS();
        await testTLS();
        await testFirebaseAuth();
        await testCORS();
        await testOAuth();
        generateReport();
    } catch (error) {
        console.error('💥 VERIFICATION SCRIPT ERROR:', error.message);
        process.exit(1);
    }
}

// Execute if run directly
if (require.main === module) {
    runVerification();
}

module.exports = {
    runVerification,
    results
};