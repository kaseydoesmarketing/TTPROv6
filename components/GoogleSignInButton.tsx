'use client'

import { useState } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { signInWithGoogle, signOut } from '@/lib/auth/firebase-client'

export default function GoogleSignInButton() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const user = await signInWithGoogle()
      
      // Get the ID token
      const idToken = await user.getIdToken()
      
      // Send token to backend (when ready)
      console.log('User signed in:', user.email)
      console.log('ID Token:', idToken.substring(0, 20) + '...')
      
    } catch (error: any) {
      console.error('Sign-in error:', error)
      setError(error.message || 'Failed to sign in with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign-out error:', error)
    }
  }

  if (user) {
    return (
      <div className="text-center">
        <div className="mb-4">
          <p className="text-green-600 font-semibold mb-2">✅ Signed in as:</p>
          <p className="text-gray-900">{user.email}</p>
        </div>
        <button 
          onClick={handleSignOut}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="text-center">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <button 
        onClick={handleSignIn}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
      >
        {loading ? (
          <span>Signing in...</span>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign In with Google
          </>
        )}
      </button>
    </div>
  )
}