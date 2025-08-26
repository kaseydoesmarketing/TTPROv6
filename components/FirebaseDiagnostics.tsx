'use client'

import { useState, useEffect } from 'react'

/**
 * Firebase Authentication Diagnostics Component
 * Real-time browser-based testing for Firebase Auth
 */

export default function FirebaseDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    setDiagnostics([])
    
    const results: any[] = []
    
    // Test 1: Firebase Config
    results.push({
      test: 'Firebase Configuration',
      status: 'running',
      details: 'Checking environment variables...'
    })
    setDiagnostics([...results])
    
    const hasValidConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                          process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'placeholder-key'
    
    results[0] = {
      test: 'Firebase Configuration',
      status: hasValidConfig ? 'success' : 'error',
      details: hasValidConfig ? 
        'Environment variables are properly configured' : 
        'Missing or invalid Firebase environment variables'
    }
    setDiagnostics([...results])
    
    // Test 2: Firebase Auth API
    results.push({
      test: 'Firebase Auth API',
      status: 'running',
      details: 'Testing Identity Toolkit API...'
    })
    setDiagnostics([...results])
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      const testUrl = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}:getRecaptchaConfig?key=${apiKey}`
      
      const response = await fetch(testUrl)
      
      if (response.ok) {
        results[1] = {
          test: 'Firebase Auth API',
          status: 'success',
          details: 'Identity Toolkit API is responding correctly'
        }
      } else if (response.status === 403) {
        results[1] = {
          test: 'Firebase Auth API',
          status: 'error',
          details: 'Authentication not enabled in Firebase Console (403 Forbidden)'
        }
      } else {
        results[1] = {
          test: 'Firebase Auth API',
          status: 'error',
          details: `API error: ${response.status} ${response.statusText}`
        }
      }
    } catch (error: any) {
      results[1] = {
        test: 'Firebase Auth API',
        status: 'error',
        details: `Network error: ${error.message}`
      }
    }
    setDiagnostics([...results])
    
    // Test 3: Firebase SDK Initialization
    results.push({
      test: 'Firebase SDK Initialization',
      status: 'running',
      details: 'Testing Firebase app initialization...'
    })
    setDiagnostics([...results])
    
    try {
      const { auth } = await import('@/lib/auth/firebase-client')
      
      if (auth && typeof auth.onAuthStateChanged === 'function') {
        results[2] = {
          test: 'Firebase SDK Initialization',
          status: 'success',
          details: 'Firebase SDK initialized successfully'
        }
      } else {
        results[2] = {
          test: 'Firebase SDK Initialization',
          status: 'error',
          details: 'Firebase SDK not properly initialized (mock mode)'
        }
      }
    } catch (error: any) {
      results[2] = {
        test: 'Firebase SDK Initialization',
        status: 'error',
        details: `SDK initialization error: ${error.message}`
      }
    }
    setDiagnostics([...results])
    
    // Test 4: Console Network Analysis
    results.push({
      test: 'Browser Console Check',
      status: 'info',
      details: 'Check browser DevTools Console and Network tabs for additional errors'
    })
    setDiagnostics([...results])
    
    setIsRunning(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'running': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'running': return '⏳'
      default: return 'ℹ️'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🔥 Firebase Authentication Diagnostics
      </h2>
      
      <div className="mb-6 text-center">
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </button>
      </div>

      {diagnostics.length > 0 && (
        <div className="space-y-4">
          {diagnostics.map((diagnostic, index) => (
            <div 
              key={index} 
              className="p-4 border rounded-lg bg-gray-50"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">
                  {getStatusIcon(diagnostic.status)} {diagnostic.test}
                </h3>
                <span className={`font-medium ${getStatusColor(diagnostic.status)}`}>
                  {diagnostic.status.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-700">{diagnostic.details}</p>
            </div>
          ))}
        </div>
      )}

      {!isRunning && diagnostics.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">
            🔧 Next Steps:
          </h3>
          <ul className="text-yellow-700 space-y-1">
            <li>1. Visit Firebase Console to enable Authentication</li>
            <li>2. Enable Google Sign-In provider with Web client ID</li>
            <li>3. Add authorized domains (titletesterpro.com, www.titletesterpro.com)</li>
            <li>4. Verify Google Cloud OAuth settings</li>
          </ul>
        </div>
      )}
    </div>
  )
}