// Demo dashboard - accessible without authentication
'use client'

import { useState } from 'react'

// Mock data for demonstration
const mockStats = {
  campaigns: {
    total: 12,
    active: 3,
    completed: 8,
    paused: 1,
    error: 0
  },
  performance: {
    totalViewsGained: 45329,
    averageImprovement: 27.8,
    totalTitleTests: 24,
    successRate: 87.5,
    topPerformingTitle: {
      title: "This SECRET YouTube Algorithm Trick Increased My Views by 340%",
      improvement: 340,
      vph: 1250
    }
  },
  recent: {
    campaignsThisWeek: 2,
    viewsThisWeek: 8432,
    testsThisWeek: 6,
    avgPerformanceThisWeek: 23.4
  },
  quota: {
    usagePercent: 67,
    remainingUnits: 3300,
    circuitBreakerTripped: false
  }
}

const mockCampaigns = [
  {
    id: 'camp-1',
    videoId: 'abc123',
    videoTitle: 'Ultimate YouTube Growth Strategy',
    originalTitle: 'How to Grow on YouTube in 2024',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    status: 'ACTIVE',
    titleVariations: [
      'How to Grow on YouTube in 2024',
      'SECRET YouTube Growth Strategy That Actually Works',
      'I Grew 100K Subscribers Using This YouTube Trick'
    ],
    rotationHours: 24,
    totalDurationHours: 168,
    currentTitle: 'SECRET YouTube Growth Strategy That Actually Works',
    currentTitleIndex: 1,
    nextRotationAt: '2024-08-26T12:00:00Z',
    startsAt: '2024-08-20T00:00:00Z',
    endsAt: '2024-08-27T00:00:00Z',
    winningVph: 425,
    improvementPercent: 23.4,
    totalViewsGained: 1847,
    rotationCount: 7,
    recentRotations: [
      {
        title: 'How to Grow on YouTube in 2024',
        vph: 345,
        viewsGained: 623,
        duration: '24h'
      },
      {
        title: 'SECRET YouTube Growth Strategy That Actually Works',
        vph: 425,
        viewsGained: 812,
        duration: '18h (current)'
      }
    ]
  },
  {
    id: 'camp-2',
    videoId: 'def456',
    videoTitle: 'Complete Beginner\'s Guide',
    originalTitle: 'Beginner\'s Guide to Content Creation',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    status: 'ACTIVE',
    titleVariations: [
      'Beginner\'s Guide to Content Creation',
      'COMPLETE Beginner\'s Guide (Step-by-Step)',
      'From Zero to Creator: The Ultimate Beginner Guide'
    ],
    rotationHours: 12,
    totalDurationHours: 72,
    currentTitle: 'COMPLETE Beginner\'s Guide (Step-by-Step)',
    currentTitleIndex: 1,
    nextRotationAt: '2024-08-25T18:00:00Z',
    startsAt: '2024-08-23T00:00:00Z',
    endsAt: '2024-08-26T00:00:00Z',
    winningVph: 289,
    improvementPercent: 45.2,
    totalViewsGained: 1234,
    rotationCount: 4
  }
]

const mockCompletedCampaigns = [
  {
    id: 'comp-1',
    videoId: 'xyz789',
    videoTitle: 'My Epic Journey',
    originalTitle: 'My Journey as a Content Creator',
    status: 'COMPLETED',
    winningTitle: 'The INSANE Journey That Changed Everything (Shocking Results)',
    winningVph: 892,
    improvementPercent: 156.7,
    totalViewsGained: 4521,
    completedAt: '2024-08-22T15:30:00Z'
  }
]

export default function DemoPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getTimeUntilNextRotation = (nextRotation: string) => {
    const now = new Date()
    const next = new Date(nextRotation)
    const diff = next.getTime() - now.getTime()
    
    if (diff <= 0) return 'Rotating now...'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
      PAUSED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ERROR: 'bg-red-100 text-red-800 border-red-200'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status as keyof typeof styles] || styles.ACTIVE}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm">
            🎭 <strong>DEMO DASHBOARD</strong> - This shows what the authenticated dashboard looks like with sample data.
            <span className="ml-2 text-purple-100">Configure Firebase to access the real dashboard</span>
          </p>
        </div>
      </div>

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
              
              {/* Demo Quota Indicator */}
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">
                  Quota: {mockStats.quota.usagePercent}% ({formatNumber(mockStats.quota.remainingUnits)} left)
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg" title="Refresh data">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
              
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                  alt="Demo User"
                  className="w-8 h-8 rounded-full"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">Demo User</p>
                  <p className="text-xs text-gray-500">demo@example.com</p>
                </div>
              </div>
              
              <button className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
                Sign Out (Demo)
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tests</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.campaigns.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Views Gained</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(mockStats.performance.totalViewsGained)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Improvement</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.performance.averageImprovement}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.performance.successRate}%</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Active Campaigns Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Active Tests</h2>
              <p className="text-sm text-gray-500 mt-1">Currently running title experiments</p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Create New Test
            </button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {mockCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <img
                        src={campaign.thumbnailUrl}
                        alt={campaign.videoTitle}
                        className="w-16 h-12 rounded-lg object-cover bg-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{campaign.videoTitle}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Testing {campaign.titleVariations.length} variations
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>

                  {/* Current Title */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Current Title</p>
                    <p className="text-sm text-gray-900 bg-primary-50 px-3 py-2 rounded-lg border">
                      {campaign.currentTitle}
                    </p>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{campaign.winningVph}</p>
                      <p className="text-xs text-gray-500">Best VPH</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">+{campaign.improvementPercent}%</p>
                      <p className="text-xs text-gray-500">Improvement</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{formatNumber(campaign.totalViewsGained!)}</p>
                      <p className="text-xs text-gray-500">Views Gained</p>
                    </div>
                  </div>

                  {/* Next Rotation Countdown */}
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-600">Next rotation in:</span>
                    <span className="font-medium text-primary-600">
                      {getTimeUntilNextRotation(campaign.nextRotationAt!)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Pause Test
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Completed Campaigns */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Completed Tests</h2>
              <p className="text-sm text-gray-500 mt-1">Finished experiments with results</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {mockCompletedCampaigns.map((campaign, index) => (
              <div key={campaign.id} className={`p-6 ${index > 0 ? 'border-t border-gray-200' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{campaign.videoTitle}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Winner: "{campaign.winningTitle}"
                    </p>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">+{campaign.improvementPercent}%</p>
                      <p className="text-xs text-gray-500">Improvement</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{formatNumber(campaign.totalViewsGained)}</p>
                      <p className="text-xs text-gray-500">Views Gained</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{campaign.winningVph}</p>
                      <p className="text-xs text-gray-500">Winning VPH</p>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Mock Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Create New Test (Demo)</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-center py-12">
                This is a demo modal. In the real dashboard, this would show:<br/>
                • Video selection from your YouTube channel<br/>
                • Title variation inputs<br/>
                • Test duration and rotation settings<br/>
                • Campaign configuration options
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}