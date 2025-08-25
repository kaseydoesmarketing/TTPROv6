'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/auth-provider'

interface StatsData {
  campaigns: {
    total: number
    active: number
    completed: number
    paused: number
    error: number
  }
  performance: {
    totalViewsGained: number
    averageImprovement: number
    totalTitleTests: number
    successRate: number
    topPerformingTitle?: {
      title: string
      improvement: number
      vph: number
    }
  }
  recent: {
    campaignsThisWeek: number
    viewsThisWeek: number
    testsThisWeek: number
    avgPerformanceThisWeek: number
  }
  quota: {
    usagePercent: number
    remainingUnits: number
    circuitBreakerTripped: boolean
  }
}

interface StatsGridProps {
  className?: string
  showDetailedMetrics?: boolean
  refreshInterval?: number
}

export function StatsGrid({ 
  className = '',
  showDetailedMetrics = false,
  refreshInterval = 60000 // 1 minute
}: StatsGridProps) {
  const { getToken } = useAuth()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = async () => {
    try {
      const token = await getToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch statistics')
      }

      const data = await response.json()
      setStats(data)
      setLastUpdated(new Date())
      setError('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load statistics'
      setError(errorMessage)
      console.error('Stats loading error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load and periodic refresh
  useEffect(() => {
    fetchStats()
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [refreshInterval])

  const formatNumber = (num: number, decimals: number = 0): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(decimals)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(decimals)}K`
    }
    return num.toLocaleString()
  }

  const getStatusColor = (status: keyof StatsData['campaigns']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50'
      case 'completed': return 'text-blue-600 bg-blue-50'
      case 'paused': return 'text-yellow-600 bg-yellow-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    trend, 
    colorClass = 'text-gray-900' 
  }: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ReactNode
    trend?: { value: number; isPositive: boolean }
    colorClass?: string
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            {icon}
          </div>
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <svg className={`w-4 h-4 ${trend.isPositive ? '' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span>{Math.abs(trend.value).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div className={`text-3xl font-bold ${colorClass} mb-2`}>
        {typeof value === 'number' ? formatNumber(value) : value}
      </div>
      {subtitle && (
        <p className="text-sm text-gray-600">{subtitle}</p>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="skeleton w-10 h-10 rounded-lg" />
              <div className="skeleton h-4 w-24" />
            </div>
            <div className="skeleton h-8 w-16 mb-2" />
            <div className="skeleton h-3 w-32" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-semibold text-red-900">Failed to Load Statistics</h3>
            <p className="text-sm text-red-800 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchStats}
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className={className}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Campaigns */}
        <StatCard
          title="Total Campaigns"
          value={stats.campaigns.total}
          subtitle={`${stats.campaigns.active} active, ${stats.campaigns.completed} completed`}
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          colorClass="text-blue-600"
        />

        {/* Views Gained */}
        <StatCard
          title="Total Views Gained"
          value={formatNumber(stats.performance.totalViewsGained)}
          subtitle="From all completed campaigns"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          }
          colorClass="text-green-600"
        />

        {/* Average Improvement */}
        <StatCard
          title="Avg Improvement"
          value={`${stats.performance.averageImprovement.toFixed(1)}%`}
          subtitle="Across successful campaigns"
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
          }
          colorClass="text-purple-600"
          trend={
            stats.recent.avgPerformanceThisWeek > 0 
              ? { value: stats.recent.avgPerformanceThisWeek, isPositive: true }
              : undefined
          }
        />

        {/* Success Rate */}
        <StatCard
          title="Success Rate"
          value={`${stats.performance.successRate.toFixed(1)}%`}
          subtitle="Campaigns with positive results"
          icon={
            <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          }
          colorClass="text-orange-600"
        />
      </div>

      {/* Campaign Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Campaign Status</h3>
          <div className="space-y-3">
            {Object.entries(stats.campaigns).map(([status, count]) => {
              if (status === 'total') return null
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status as keyof StatsData['campaigns']).split(' ')[1]}`} />
                    <span className="text-sm text-gray-700 capitalize">{status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{count}</span>
                    <span className="text-xs text-gray-500">
                      {stats.campaigns.total > 0 ? `(${((count / stats.campaigns.total) * 100).toFixed(0)}%)` : '(0%)'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* API Quota Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">API Quota</h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              stats.quota.circuitBreakerTripped ? 'bg-red-100 text-red-800' :
              stats.quota.usagePercent >= 90 ? 'bg-red-100 text-red-800' :
              stats.quota.usagePercent >= 75 ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {stats.quota.circuitBreakerTripped ? 'Suspended' :
               stats.quota.usagePercent >= 90 ? 'Critical' :
               stats.quota.usagePercent >= 75 ? 'High' : 'Normal'}
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Daily Usage</span>
              <span>{stats.quota.usagePercent.toFixed(1)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-fill ${
                  stats.quota.circuitBreakerTripped ? 'bg-red-600' :
                  stats.quota.usagePercent >= 90 ? 'bg-red-500' :
                  stats.quota.usagePercent >= 75 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, stats.quota.usagePercent)}%` }}
              />
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.quota.remainingUnits)}
            </div>
            <div className="text-sm text-gray-500">Units remaining</div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Top Performer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">This Week</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Campaigns</span>
              <span className="text-lg font-semibold text-gray-900">{stats.recent.campaignsThisWeek}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Views Gained</span>
              <span className="text-lg font-semibold text-gray-900">{formatNumber(stats.recent.viewsThisWeek)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Title Tests</span>
              <span className="text-lg font-semibold text-gray-900">{stats.recent.testsThisWeek}</span>
            </div>
            {stats.recent.avgPerformanceThisWeek > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Performance</span>
                <span className="text-lg font-semibold text-green-600">+{stats.recent.avgPerformanceThisWeek.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Top Performer */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Performing Title</h3>
          {stats.performance.topPerformingTitle ? (
            <div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-yellow-800 break-words">
                      &ldquo;{stats.performance.topPerformingTitle.title}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    +{stats.performance.topPerformingTitle.improvement.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Improvement</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.performance.topPerformingTitle.vph.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">Views/Hour</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <p className="text-gray-500">No completed campaigns yet</p>
              <p className="text-sm text-gray-400 mt-1">Start a campaign to see top performers</p>
            </div>
          )}
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-center mt-6 text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}
    </div>
  )
}

export default StatsGrid