'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { formatDistanceToNow, differenceInHours, format } from 'date-fns'

interface Campaign {
  id: string
  videoId: string
  videoTitle: string
  originalTitle: string
  thumbnailUrl?: string
  status: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ERROR' | 'QUOTA_EXCEEDED' | 'AUTH_FAILED' | 'CANCELLED'
  titleVariations: string[]
  rotationHours: number
  totalDurationHours: number
  currentTitle?: string
  currentTitleIndex: number
  nextRotationAt?: string
  startsAt: string
  endsAt: string
  completedAt?: string
  pausedAt?: string
  winningTitle?: string
  winningVph?: number
  improvementPercent?: number
  confidenceLevel?: number
  totalViewsGained?: number
  lastError?: string
  errorCount: number
  consecutiveErrors: number
  createdAt: string
  updatedAt: string
  // Calculated metrics from API
  rotationCount: number
  recentRotations: Array<{
    id: string
    title: string
    titleIndex: number
    activatedAt: string
    deactivatedAt?: string
    viewsStart: number
    viewsEnd?: number
    viewsGained?: number
    viewsPerHour?: number
  }>
  currentTotalViews: number
  currentAvgVph: number
  progressPercent: number
}

interface CampaignCardProps {
  campaign: Campaign
  onPause: (campaignId: string) => Promise<void>
  onResume: (campaignId: string) => Promise<void>
  onCancel: (campaignId: string) => Promise<void>
  isLoading?: boolean
}

export function CampaignCard({ 
  campaign, 
  onPause, 
  onResume, 
  onCancel, 
  isLoading = false 
}: CampaignCardProps) {
  const { getToken } = useAuth()
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [nextRotationIn, setNextRotationIn] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Real-time countdown updates
  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date()
      const endDate = new Date(campaign.endsAt)
      
      if (now < endDate) {
        const hours = differenceInHours(endDate, now)
        const days = Math.floor(hours / 24)
        const remainingHours = hours % 24
        
        if (days > 0) {
          setTimeLeft(`${days}d ${remainingHours}h`)
        } else if (hours > 0) {
          setTimeLeft(`${hours}h`)
        } else {
          const minutes = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60))
          setTimeLeft(`${Math.max(0, minutes)}m`)
        }
      } else {
        setTimeLeft('Ended')
      }

      // Next rotation countdown
      if (campaign.nextRotationAt && campaign.status === 'ACTIVE') {
        const nextRotation = new Date(campaign.nextRotationAt)
        if (now < nextRotation) {
          const rotationHours = differenceInHours(nextRotation, now)
          const rotationMinutes = Math.floor((nextRotation.getTime() - now.getTime()) / (1000 * 60)) % 60
          
          if (rotationHours > 0) {
            setNextRotationIn(`${rotationHours}h ${rotationMinutes}m`)
          } else {
            setNextRotationIn(`${Math.max(0, rotationMinutes)}m`)
          }
        } else {
          setNextRotationIn('Due now')
        }
      } else {
        setNextRotationIn('')
      }
    }

    updateCountdowns()
    const interval = setInterval(updateCountdowns, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [campaign.endsAt, campaign.nextRotationAt, campaign.status])

  const getStatusBadge = () => {
    const baseClasses = 'badge'
    
    switch (campaign.status) {
      case 'ACTIVE':
        return `${baseClasses} badge-active`
      case 'PAUSED':
        return `${baseClasses} badge-paused`
      case 'COMPLETED':
        return `${baseClasses} badge-completed`
      case 'ERROR':
      case 'QUOTA_EXCEEDED':
      case 'AUTH_FAILED':
        return `${baseClasses} badge-error`
      case 'PENDING':
        return `${baseClasses} badge-pending`
      case 'CANCELLED':
        return `${baseClasses} bg-gray-100 text-gray-600`
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`
    }
  }

  const getStatusText = () => {
    switch (campaign.status) {
      case 'ACTIVE':
        return 'Active'
      case 'PAUSED':
        return 'Paused'
      case 'COMPLETED':
        return 'Completed'
      case 'ERROR':
        return 'Error'
      case 'QUOTA_EXCEEDED':
        return 'Quota Exceeded'
      case 'AUTH_FAILED':
        return 'Auth Failed'
      case 'PENDING':
        return 'Pending'
      case 'CANCELLED':
        return 'Cancelled'
      default:
        return campaign.status
    }
  }

  const handleAction = async (action: 'pause' | 'resume' | 'cancel') => {
    setIsUpdating(true)
    try {
      switch (action) {
        case 'pause':
          await onPause(campaign.id)
          break
        case 'resume':
          await onResume(campaign.id)
          break
        case 'cancel':
          await onCancel(campaign.id)
          break
      }
    } catch (error) {
      console.error(`Failed to ${action} campaign:`, error)
    } finally {
      setIsUpdating(false)
    }
  }

  const canPause = campaign.status === 'ACTIVE'
  const canResume = campaign.status === 'PAUSED'
  const canCancel = ['ACTIVE', 'PAUSED', 'PENDING'].includes(campaign.status)

  return (
    <div className="card fade-in" role="article" aria-label={`Campaign for ${campaign.videoTitle}`}>
      {/* Campaign Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Video Thumbnail */}
        <div className="flex-shrink-0">
          {campaign.thumbnailUrl ? (
            <img
              src={campaign.thumbnailUrl}
              alt={`Thumbnail for ${campaign.videoTitle}`}
              className="w-20 h-12 rounded object-cover border"
              loading="lazy"
            />
          ) : (
            <div className="w-20 h-12 bg-gray-200 rounded border flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Campaign Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className={getStatusBadge()}>
              {getStatusText()}
            </span>
            <span className="text-sm text-gray-500">
              {timeLeft !== 'Ended' ? `${timeLeft} remaining` : 'Campaign ended'}
            </span>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-1 truncate" title={campaign.videoTitle}>
            {campaign.videoTitle}
          </h3>
          
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              <span className="font-medium">Current Title:</span>{' '}
              <span className="text-gray-800" title={campaign.currentTitle}>
                {campaign.currentTitle ? 
                  (campaign.currentTitle.length > 60 ? 
                    `${campaign.currentTitle.substring(0, 60)}...` : 
                    campaign.currentTitle
                  ) : 
                  'Not set'
                }
              </span>
            </div>
            
            {nextRotationIn && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Next rotation in {nextRotationIn}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.min(100, Math.max(0, campaign.progressPercent))}%</span>
        </div>
        <div className="progress-bar" role="progressbar" aria-valuenow={campaign.progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div 
            className="progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, campaign.progressPercent))}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="metric-card">
          <div className="metric-value">{campaign.titleVariations.length}</div>
          <div className="metric-label">Title Variants</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">{campaign.rotationCount}</div>
          <div className="metric-label">Rotations</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">{campaign.currentTotalViews.toLocaleString()}</div>
          <div className="metric-label">Total Views</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">
            {campaign.currentAvgVph > 0 ? campaign.currentAvgVph.toFixed(1) : '—'}
          </div>
          <div className="metric-label">Avg VPH</div>
        </div>
      </div>

      {/* Winning Title Section (if completed) */}
      {campaign.status === 'COMPLETED' && campaign.winningTitle && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-green-900 mb-1">Winning Title</h4>
              <p className="text-sm text-green-800 break-words">{campaign.winningTitle}</p>
              {campaign.improvementPercent && (
                <p className="text-sm text-green-700 mt-1">
                  <span className="font-semibold">+{campaign.improvementPercent.toFixed(1)}%</span> improvement
                  {campaign.winningVph && (
                    <span className="ml-2">({campaign.winningVph.toFixed(1)} VPH)</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {campaign.lastError && ['ERROR', 'QUOTA_EXCEEDED', 'AUTH_FAILED'].includes(campaign.status) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-red-900 mb-1">Error Details</h4>
              <p className="text-sm text-red-800 break-words">{campaign.lastError}</p>
              {campaign.consecutiveErrors > 1 && (
                <p className="text-sm text-red-700 mt-1">
                  {campaign.consecutiveErrors} consecutive errors
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Created {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}
        </div>
        
        <div className="flex items-center gap-2">
          {canPause && (
            <button
              onClick={() => handleAction('pause')}
              disabled={isUpdating || isLoading}
              className="btn-outline text-sm px-3 py-1.5 focus-ring"
              aria-label="Pause campaign"
            >
              {isUpdating ? (
                <div className="loading-spinner w-4 h-4" />
              ) : (
                'Pause'
              )}
            </button>
          )}
          
          {canResume && (
            <button
              onClick={() => handleAction('resume')}
              disabled={isUpdating || isLoading}
              className="btn-primary text-sm px-3 py-1.5 focus-ring"
              aria-label="Resume campaign"
            >
              {isUpdating ? (
                <div className="loading-spinner w-4 h-4" />
              ) : (
                'Resume'
              )}
            </button>
          )}
          
          {canCancel && (
            <button
              onClick={() => handleAction('cancel')}
              disabled={isUpdating || isLoading}
              className="btn-danger text-sm px-3 py-1.5 focus-ring"
              aria-label="Cancel campaign"
            >
              {isUpdating ? (
                <div className="loading-spinner w-4 h-4" />
              ) : (
                'Cancel'
              )}
            </button>
          )}
          
          <a
            href={`https://youtube.com/watch?v=${campaign.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-sm px-3 py-1.5 focus-ring"
            aria-label="View video on YouTube"
          >
            View Video
          </a>
        </div>
      </div>
    </div>
  )
}

export default CampaignCard