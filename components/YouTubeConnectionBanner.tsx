'use client'

import { useState } from 'react'
import { useAuth } from '@/providers/auth-provider'

interface YouTubeConnectionBannerProps {
  isConnected: boolean
  channelName?: string
  channelId?: string
  onConnectionUpdate?: () => void
  className?: string
}

export function YouTubeConnectionBanner({ 
  isConnected, 
  channelName, 
  channelId, 
  onConnectionUpdate,
  className = ''
}: YouTubeConnectionBannerProps) {
  const { getToken } = useAuth()
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string>('')
  const [showDetails, setShowDetails] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    setError('')

    try {
      const token = await getToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/auth/youtube/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to initiate YouTube connection')
      }

      const data = await response.json()
      
      // Redirect to YouTube OAuth
      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        throw new Error('No authorization URL received')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to YouTube'
      setError(errorMessage)
      console.error('YouTube connection error:', err)
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your YouTube account? This will stop all active campaigns.')) {
      return
    }

    setIsConnecting(true)
    setError('')

    try {
      const token = await getToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/auth/youtube/disconnect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to disconnect YouTube account')
      }

      if (onConnectionUpdate) {
        onConnectionUpdate()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect YouTube account'
      setError(errorMessage)
      console.error('YouTube disconnection error:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  if (isConnected && channelName) {
    // Connected state - show minimal success banner
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">YouTube Connected</h3>
              <p className="text-sm text-green-800">
                Connected to <span className="font-medium">{channelName}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-green-700 hover:text-green-800 focus-ring rounded px-2 py-1"
              aria-expanded={showDetails}
              aria-controls="connection-details"
            >
              {showDetails ? 'Hide' : 'Details'}
            </button>
          </div>
        </div>

        {showDetails && (
          <div id="connection-details" className="mt-4 pt-4 border-t border-green-200">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-green-900">Channel Name</dt>
                <dd className="text-green-800 mt-1">{channelName}</dd>
              </div>
              {channelId && (
                <div>
                  <dt className="font-medium text-green-900">Channel ID</dt>
                  <dd className="text-green-800 mt-1 font-mono text-xs">{channelId}</dd>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-green-200 flex justify-between items-center">
              <p className="text-sm text-green-700">
                You can now create campaigns and manage your video titles.
              </p>
              <button
                onClick={handleDisconnect}
                disabled={isConnecting}
                className="text-sm text-red-600 hover:text-red-700 focus-ring rounded px-2 py-1"
              >
                {isConnecting ? (
                  <>
                    <div className="loading-spinner w-3 h-3 mr-1 inline-block" />
                    Disconnecting...
                  </>
                ) : (
                  'Disconnect'
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
    )
  }

  // Not connected state - show prominent call-to-action banner
  return (
    <div className={`bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">Connect Your YouTube Channel</h2>
          <p className="text-red-100 mb-4 leading-relaxed">
            To start testing and optimizing your video titles, you need to connect your YouTube channel. 
            This allows TitleTesterPro to access your videos and update titles automatically.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-white">Secure Access</h4>
                <p className="text-red-100 text-sm">OAuth2 authentication with Google</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-white">Limited Permissions</h4>
                <p className="text-red-100 text-sm">Only video title management access</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-white">Automated Testing</h4>
                <p className="text-red-100 text-sm">Set up campaigns in minutes</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-white">Real-time Analytics</h4>
                <p className="text-red-100 text-sm">Track performance metrics</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-800 bg-opacity-50 border border-red-300 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-200 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-medium text-red-100">Connection Failed</h4>
                  <p className="text-red-200 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
            >
              {isConnecting ? (
                <>
                  <div className="loading-spinner w-5 h-5 mr-2 inline-block" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2 inline-block" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Connect YouTube Channel
                </>
              )}
            </button>
            
            <p className="text-red-100 text-sm">
              By connecting, you agree to our{' '}
              <a href="/privacy" className="underline hover:text-white" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
      
      {/* Privacy note */}
      <div className="mt-6 pt-6 border-t border-red-400 border-opacity-30">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-200 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="font-semibold text-red-100 mb-1">Your Privacy Matters</h4>
            <p className="text-red-200 text-sm leading-relaxed">
              We only request minimal permissions needed for title testing. We never access your personal data, 
              comments, or analytics. You can revoke access at any time from your Google account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default YouTubeConnectionBanner