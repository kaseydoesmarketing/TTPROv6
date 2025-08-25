// Main dashboard with campaign management
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { useQuery } from '@tanstack/react-query'
import { signOut } from '@/lib/auth/firebase-client'
import { CampaignCard } from '@/components/CampaignCard'
import { CreateCampaignModal } from '@/components/CreateCampaignModal'
import { YouTubeConnectionBanner } from '@/components/YouTubeConnectionBanner'
import { QuotaIndicator } from '@/components/QuotaIndicator'
import { StatsGrid } from '@/components/StatsGrid'

export default function Dashboard() {
  const { user, loading, getToken } = useAuth()
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Fetch user profile and session data
  const { data: sessionData, refetch: refetchSession } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      
      const response = await fetch('/api/auth/session', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) {
        throw new Error('Session fetch failed')
      }
      
      return response.json()
    },
    enabled: !!user,
  })

  // Update user profile when session data changes
  useEffect(() => {
    if (sessionData?.user) {
      setUserProfile(sessionData.user)
    }
  }, [sessionData])

  // Fetch campaigns
  const { data: campaignData, refetch: refetchCampaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      
      const response = await fetch('/api/campaigns', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }
      
      return response.json()
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch quota status
  const { data: quotaData } = useQuery({
    queryKey: ['quota'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      
      const response = await fetch('/api/quota/status', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch quota')
      }
      
      return response.json()
    },
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
  })

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleRefresh = () => {
    refetchCampaigns()
    refetchSession()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="loading-spinner w-6 h-6"></div>
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!user) return null

  const campaigns = campaignData?.campaigns || []
  const campaignSummary = campaignData?.summary || {}
  const quotaStatus = quotaData?.quota || {}

  const activeCampaigns = campaigns.filter((c: any) => c.status === 'ACTIVE')
  const completedCampaigns = campaigns.filter((c: any) => c.status === 'COMPLETED')
  const canCreateCampaign = userProfile?.youtubeConnected && 
    activeCampaigns.length < (userProfile?.maxDailyCampaigns || 3) &&
    !quotaStatus.circuitBreakerActive

  return (
    <div className="min-h-screen bg-gray-50">
      {/* YouTube Connection Banner */}
      {userProfile && !userProfile.youtubeConnected && (
        <YouTubeConnectionBanner 
          isConnected={false} 
          onConnectionUpdate={() => refetchSession()}
          className="mx-6 mt-6"
        />
      )}
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">TitleTesterPro</h1>
              </div>
              <QuotaIndicator />
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                title="Refresh data"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
              
              <div className="flex items-center space-x-3">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <StatsGrid className="px-6" />

        {/* Active Campaigns Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Active Tests</h2>
              <p className="text-sm text-gray-500 mt-1">
                Currently running title experiments
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!canCreateCampaign}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                !userProfile?.youtubeConnected 
                  ? 'Connect YouTube first' 
                  : !canCreateCampaign 
                  ? 'Campaign limit reached or quota exceeded' 
                  : 'Create new test'
              }
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Create New Test
            </button>
          </div>
          
          {activeCampaigns.length === 0 ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active tests</h3>
              <p className="text-gray-500 mb-6">
                Create your first title test to start optimizing your YouTube videos
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={!canCreateCampaign}
                className="btn-primary"
              >
                {!userProfile?.youtubeConnected 
                  ? 'Connect YouTube First' 
                  : 'Create Your First Test'
                }
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {activeCampaigns.map((campaign: any) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onPause={async () => {}}
                  onResume={async () => {}}
                  onCancel={async () => {}}
                />
              ))}
            </div>
          )}
        </section>

        {/* Completed Campaigns Section */}
        {completedCampaigns.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Completed Tests</h2>
              <p className="text-sm text-gray-500 mt-1">
                Your finished experiments and their results
              </p>
            </div>
            
            <div className="grid gap-6">
              {completedCampaigns.slice(0, 5).map((campaign: any) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onPause={async () => {}}
                  onResume={async () => {}}
                  onCancel={async () => {}}
                />
              ))}
              
              {completedCampaigns.length > 5 && (
                <div className="text-center py-4">
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View all {completedCampaigns.length} completed tests →
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCampaignCreated={() => {
          handleRefresh()
          setShowCreateModal(false)
        }}
      />
    </div>
  )
}