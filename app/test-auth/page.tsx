'use client'

import { useEffect } from 'react'

export default function TestAuth() {
  useEffect(() => {
    console.log('=== AUTH TEST PAGE ===')
    console.log('Window exists:', typeof window !== 'undefined')
    console.log('Environment variables:', {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })

    // Test Firebase import
    import('../../lib/auth/firebase-client').then(({ auth, signInWithGoogle }) => {
      console.log('Firebase auth object:', auth)
      console.log('signInWithGoogle function:', typeof signInWithGoogle)
    }).catch(error => {
      console.error('Firebase import error:', error)
    })
  }, [])

  const handleTestSignIn = async () => {
    try {
      console.log('Testing sign in...')
      const { signInWithGoogle } = await import('../../lib/auth/firebase-client')
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in test error:', error)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Test</h1>
      <button 
        onClick={handleTestSignIn}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test Google Sign In
      </button>
      <p className="mt-4">Check browser console for debug info</p>
    </div>
  )
}