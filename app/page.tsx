// Landing page with Firebase authentication
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { signInWithGoogle } from '@/lib/auth/firebase-client'
import { SystemLogger } from '@/lib/logging'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) {
      router.push('/app')
    }
  }, [user, loading, router])

  const handleSignIn = async () => {
    setIsSigningIn(true)
    setSignInError(null)
    try {
      await signInWithGoogle()
      // User will be redirected by useEffect
    } catch (error) {
      console.error('Sign in error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      setSignInError(errorMessage)
      setIsSigningIn(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-gray-100">
        <div className="flex items-center space-x-2">
          <div className="loading-spinner w-6 h-6"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100">
      {/* Demo Mode Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm">
            🚧 <strong>Demo Mode</strong> - This is a showcase deployment. Authentication requires Firebase configuration.
            <span className="ml-2 text-blue-100">See DEPLOYMENT_COMPLETE.md for setup instructions</span>
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TitleTesterPro</span>
              <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full font-medium">v6</span>
            </div>
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="btn-primary flex items-center space-x-2"
            >
              {isSigningIn ? (
                <>
                  <div className="loading-spinner w-4 h-4"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
            Optimize Your YouTube Titles with
            <span className="text-primary-600"> Data-Driven A/B Testing</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 text-balance">
            TitleTesterPro automatically rotates your video titles and measures performance 
            to find the winning variation that maximizes views and engagement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="btn-primary text-lg px-8 py-4"
            >
              {isSigningIn ? (
                <div className="flex items-center space-x-2">
                  <div className="loading-spinner w-5 h-5"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Start Testing for Free'
              )}
            </button>
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              No credit card required
            </div>
          </div>

          {/* Error Message */}
          {signInError && (
            <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
                  <p className="text-sm text-red-700 mt-1">{signInError}</p>
                  {signInError.includes('Firebase not configured') && (
                    <p className="text-xs text-red-600 mt-2">
                      This is a demo deployment. The admin needs to configure Firebase environment variables to enable sign-in.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Automated Testing</h3>
              <p className="text-gray-600">
                Set up once and let our system automatically rotate titles and collect performance data.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
              <p className="text-gray-600">
                Track views per hour, engagement rates, and statistical significance in real-time.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">
                Enterprise-grade security with quota management and error handling built-in.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl p-8 shadow-medium">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="metric-value">20-50%</div>
                <div className="metric-label">Average View Increase</div>
              </div>
              <div>
                <div className="metric-value">24/7</div>
                <div className="metric-label">Automated Testing</div>
              </div>
              <div>
                <div className="metric-value">5min</div>
                <div className="metric-label">Setup Time</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Join thousands of creators optimizing their YouTube performance
            </p>
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="btn-primary text-lg px-8 py-4"
            >
              {isSigningIn ? 'Signing in...' : 'Get Started Now'}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2024 TitleTesterPro v6. Built for serious YouTube creators.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}