'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/auth-provider'

interface QuotaData {
  totalUnitsUsed: number
  dailyLimit: number
  videoListCalls: number
  videoUpdateCalls: number
  remainingUnits: number
  usagePercent: number
  resetTime: string
  circuitBreakerTripped: boolean
  peakHourUsage?: number
  peakHourUtc?: number
}

interface QuotaIndicatorProps {
  className?: string
  showDetails?: boolean
  refreshInterval?: number
}

export function QuotaIndicator({ 
  className = '', 
  showDetails = false,
  refreshInterval = 30000 // 30 seconds
}: QuotaIndicatorProps) {
  const { getToken } = useAuth()
  const [quotaData, setQuotaData] = useState<QuotaData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isExpanded, setIsExpanded] = useState(showDetails)

  const fetchQuotaData = async () => {
    try {
      const token = await getToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/quota', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch quota data')
      }

      const data = await response.json()
      setQuotaData(data)
      setLastUpdated(new Date())
      setError('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load quota data'
      setError(errorMessage)
      console.error('Quota data error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load and periodic refresh
  useEffect(() => {
    fetchQuotaData()
    
    const interval = setInterval(fetchQuotaData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  const getStatusColor = () => {
    if (!quotaData) return 'gray'
    if (quotaData.circuitBreakerTripped) return 'red'
    if (quotaData.usagePercent >= 90) return 'red'
    if (quotaData.usagePercent >= 75) return 'yellow'
    if (quotaData.usagePercent >= 50) return 'orange'
    return 'green'
  }

  const getStatusMessage = () => {
    if (!quotaData) return 'Loading...'
    if (quotaData.circuitBreakerTripped) return 'API temporarily suspended'
    if (quotaData.usagePercent >= 90) return 'Quota nearly exhausted'
    if (quotaData.usagePercent >= 75) return 'High usage detected'
    if (quotaData.usagePercent >= 50) return 'Moderate usage'
    return 'Normal usage'
  }

  const getStatusIcon = () => {
    const statusColor = getStatusColor()
    
    if (quotaData?.circuitBreakerTripped) {
      return (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
        </svg>
      )
    }
    
    switch (statusColor) {
      case 'red':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'yellow':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'orange':
        return (
          <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const formatResetTime = (resetTime: string) => {
    const reset = new Date(resetTime)
    const now = new Date()
    const hoursUntilReset = Math.max(0, Math.floor((reset.getTime() - now.getTime()) / (1000 * 60 * 60)))
    const minutesUntilReset = Math.max(0, Math.floor(((reset.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60)))
    
    if (hoursUntilReset > 0) {
      return `${hoursUntilReset}h ${minutesUntilReset}m`
    } else if (minutesUntilReset > 0) {
      return `${minutesUntilReset}m`
    } else {
      return 'Soon'
    }
  }

  if (isLoading && !quotaData) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="loading-spinner w-5 h-5" />
          <div className="flex-1">
            <div className="skeleton h-4 w-24 mb-2" />
            <div className="skeleton h-3 w-32" />
          </div>
        </div>
      </div>
    )
  }

  if (error && !quotaData) {
    return (
      <div className={`bg-white rounded-lg border border-red-200 p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-900">Quota Status Error</p>
            <p className="text-xs text-red-700 truncate">{error}</p>
          </div>
          <button
            onClick={fetchQuotaData}
            className="text-xs text-red-700 hover:text-red-800 focus-ring rounded px-2 py-1"
            disabled={isLoading}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!quotaData) return null

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">API Quota Status</h3>
              <p className="text-xs text-gray-600">{getStatusMessage()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {quotaData.usagePercent.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500">
                {quotaData.totalUnitsUsed.toLocaleString()}/{quotaData.dailyLimit.toLocaleString()}
              </div>
            </div>
            
            {!showDetails && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-600 focus-ring rounded p-1"
                aria-expanded={isExpanded}
                aria-label="Toggle quota details"
              >
                <svg 
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="progress-bar">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                quotaData.circuitBreakerTripped ? 'bg-red-600' :
                quotaData.usagePercent >= 90 ? 'bg-red-500' :
                quotaData.usagePercent >= 75 ? 'bg-yellow-500' :
                quotaData.usagePercent >= 50 ? 'bg-orange-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, quotaData.usagePercent)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              Resets in {formatResetTime(quotaData.resetTime)}
            </span>
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {(isExpanded || showDetails) && (
        <div className="border-t border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm font-medium text-gray-900">Remaining Units</div>
              <div className="text-lg font-bold text-green-600">
                {quotaData.remainingUnits.toLocaleString()}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-900">Daily Limit</div>
              <div className="text-lg font-bold text-gray-700">
                {quotaData.dailyLimit.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Usage Breakdown */}
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-medium text-gray-900">Usage Breakdown</h4>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Video List Calls</span>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">{quotaData.videoListCalls}</span>
                <span className="text-xs text-gray-500 ml-1">× 1 unit</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Video Update Calls</span>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">{quotaData.videoUpdateCalls}</span>
                <span className="text-xs text-gray-500 ml-1">× 50 units</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center font-medium">
                <span className="text-sm text-gray-900">Total Units Used</span>
                <span className="text-sm text-gray-900">{quotaData.totalUnitsUsed.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Peak Usage Info */}
          {quotaData.peakHourUsage && quotaData.peakHourUtc !== undefined && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <h4 className="text-sm font-medium text-blue-900 mb-1">Peak Usage Today</h4>
              <p className="text-sm text-blue-800">
                {quotaData.peakHourUsage} units used during hour {quotaData.peakHourUtc} UTC
              </p>
            </div>
          )}

          {/* Circuit Breaker Warning */}
          {quotaData.circuitBreakerTripped && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-red-900">API Suspended</h4>
                  <p className="text-sm text-red-800 mt-1">
                    API calls are temporarily suspended due to quota limits. 
                    Normal service will resume when the quota resets.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {quotaData.usagePercent >= 75 && !quotaData.circuitBreakerTripped && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-900">High Usage Warning</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    Consider pausing non-critical campaigns to preserve quota for the remainder of the day.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Auto-refreshes every {Math.floor(refreshInterval / 1000)} seconds
            </p>
            <button
              onClick={fetchQuotaData}
              disabled={isLoading}
              className="text-xs text-gray-600 hover:text-gray-800 focus-ring rounded px-2 py-1"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner w-3 h-3 mr-1 inline-block" />
                  Updating...
                </>
              ) : (
                'Refresh Now'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuotaIndicator