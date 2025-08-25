'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/providers/auth-provider'

interface Video {
  id: string
  title: string
  thumbnail: string
  channelId: string
  publishedAt: string
  viewCount?: number
  likeCount?: number
}

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onCampaignCreated: () => void
}

interface CampaignFormData {
  videoId: string
  titleVariations: string[]
  rotationHours: number
  totalDurationHours: number
  startsAt: string
}

export function CreateCampaignModal({ isOpen, onClose, onCampaignCreated }: CreateCampaignModalProps) {
  const { getToken } = useAuth()
  
  // Modal state
  const [step, setStep] = useState<'video-selection' | 'campaign-setup'>('video-selection')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  
  // Video selection state
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [videoError, setVideoError] = useState<string>('')
  
  // Campaign form state
  const [formData, setFormData] = useState<CampaignFormData>({
    videoId: '',
    titleVariations: ['', ''],
    rotationHours: 6,
    totalDurationHours: 24,
    startsAt: new Date(Date.now() + 5 * 60000).toISOString().slice(0, 16) // 5 minutes from now
  })
  
  // Form validation
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Load user's videos when modal opens
  useEffect(() => {
    if (isOpen && step === 'video-selection' && videos.length === 0) {
      loadVideos()
    }
  }, [isOpen, step])

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setStep('video-selection')
      setSelectedVideo(null)
      setError('')
      setVideoError('')
      setValidationErrors({})
      setFormData({
        videoId: '',
        titleVariations: ['', ''],
        rotationHours: 6,
        totalDurationHours: 24,
        startsAt: new Date(Date.now() + 5 * 60000).toISOString().slice(0, 16)
      })
    }
  }, [isOpen])

  const loadVideos = async () => {
    setLoadingVideos(true)
    setVideoError('')
    
    try {
      const token = await getToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/videos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to load videos')
      }

      const data = await response.json()
      setVideos(data.videos || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load videos'
      setVideoError(errorMessage)
      console.error('Video loading error:', err)
    } finally {
      setLoadingVideos(false)
    }
  }

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video)
    setFormData(prev => ({
      ...prev,
      videoId: video.id
    }))
    setStep('campaign-setup')
  }

  const handleTitleVariationChange = (index: number, value: string) => {
    const newVariations = [...formData.titleVariations]
    newVariations[index] = value
    setFormData(prev => ({ ...prev, titleVariations: newVariations }))
    
    // Clear validation error for this field
    if (validationErrors[`title-${index}`]) {
      setValidationErrors(prev => {
        const { [`title-${index}`]: _, ...rest } = prev
        return rest
      })
    }
  }

  const addTitleVariation = () => {
    if (formData.titleVariations.length < 6) {
      setFormData(prev => ({
        ...prev,
        titleVariations: [...prev.titleVariations, '']
      }))
    }
  }

  const removeTitleVariation = (index: number) => {
    if (formData.titleVariations.length > 2) {
      const newVariations = formData.titleVariations.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, titleVariations: newVariations }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Validate title variations
    const nonEmptyTitles = formData.titleVariations.filter(title => title.trim())
    if (nonEmptyTitles.length < 2) {
      errors.titleVariations = 'At least 2 title variations are required'
    }

    formData.titleVariations.forEach((title, index) => {
      if (!title.trim()) {
        errors[`title-${index}`] = 'Title cannot be empty'
      } else if (title.length > 100) {
        errors[`title-${index}`] = 'Title must be 100 characters or less'
      }
    })

    // Check for duplicate titles
    const trimmedTitles = formData.titleVariations.map(t => t.trim().toLowerCase())
    const duplicates = trimmedTitles.filter((title, index) => 
      title && trimmedTitles.indexOf(title) !== index
    )
    if (duplicates.length > 0) {
      errors.titleVariations = 'All title variations must be unique'
    }

    // Validate timing
    if (formData.rotationHours < 1 || formData.rotationHours > 24) {
      errors.rotationHours = 'Rotation hours must be between 1 and 24'
    }

    if (formData.totalDurationHours < 6 || formData.totalDurationHours > 168) {
      errors.totalDurationHours = 'Total duration must be between 6 hours and 7 days'
    }

    if (formData.totalDurationHours <= formData.rotationHours) {
      errors.totalDurationHours = 'Total duration must be longer than rotation interval'
    }

    // Validate start time
    const startTime = new Date(formData.startsAt)
    const now = new Date()
    if (startTime <= now) {
      errors.startsAt = 'Campaign must start in the future'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const token = await getToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoId: formData.videoId,
          titleVariations: formData.titleVariations.filter(t => t.trim()),
          rotationHours: formData.rotationHours,
          totalDurationHours: formData.totalDurationHours,
          startsAt: formData.startsAt
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create campaign')
      }

      onCampaignCreated()
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create campaign'
      setError(errorMessage)
      console.error('Campaign creation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-xl shadow-hard max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
            Create New Campaign
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus-ring rounded-lg p-1"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'video-selection' ? 'text-primary-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step === 'video-selection' ? 'bg-primary-600 text-white' : 
                  selectedVideo ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                {selectedVideo ? '✓' : '1'}
              </div>
              <span className="font-medium">Select Video</span>
            </div>
            
            <div className="flex-1 h-px bg-gray-300"></div>
            
            <div className={`flex items-center gap-2 ${step === 'campaign-setup' ? 'text-primary-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step === 'campaign-setup' ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <span className="font-medium">Campaign Setup</span>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {step === 'video-selection' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Video to Test</h3>
                <p className="text-gray-600">Choose a video from your YouTube channel to create title variations for.</p>
              </div>

              {videoError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-900">Error loading videos</h4>
                      <p className="text-sm text-red-800 mt-1">{videoError}</p>
                      <button
                        onClick={loadVideos}
                        className="btn-outline mt-2 text-sm"
                        disabled={loadingVideos}
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {loadingVideos ? (
                <div className="flex items-center justify-center py-12">
                  <div className="loading-spinner w-8 h-8" />
                  <span className="ml-3 text-gray-600">Loading your videos...</span>
                </div>
              ) : videos.length === 0 && !videoError ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
                  <p className="text-gray-600 mb-4">We couldn&apos;t find any videos in your YouTube channel.</p>
                  <button
                    onClick={loadVideos}
                    className="btn-primary"
                  >
                    Refresh Videos
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {videos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => handleVideoSelect(video)}
                      className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left focus-ring"
                    >
                      <img
                        src={video.thumbnail}
                        alt={`Thumbnail for ${video.title}`}
                        className="w-24 h-14 rounded object-cover flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">{video.title}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Published {new Date(video.publishedAt).toLocaleDateString()}</p>
                          {video.viewCount && (
                            <p>{parseInt(String(video.viewCount)).toLocaleString()} views</p>
                          )}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'campaign-setup' && selectedVideo && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Configuration</h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={selectedVideo.thumbnail}
                    alt={`Thumbnail for ${selectedVideo.title}`}
                    className="w-12 h-7 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{selectedVideo.title}</p>
                  </div>
                  <button
                    onClick={() => setStep('video-selection')}
                    className="text-sm text-primary-600 hover:text-primary-700 focus-ring rounded px-2 py-1"
                  >
                    Change Video
                  </button>
                </div>
              </div>

              {/* Title Variations */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Title Variations
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Create 2-6 different title variations to test. Each title will be rotated at the specified interval.
                </p>
                
                {validationErrors.titleVariations && (
                  <div className="text-sm text-red-600 mb-3">{validationErrors.titleVariations}</div>
                )}
                
                <div className="space-y-3">
                  {formData.titleVariations.map((title, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-1">
                        <textarea
                          value={title}
                          onChange={(e) => handleTitleVariationChange(index, e.target.value)}
                          placeholder={`Title variation ${index + 1}${index === 0 ? ' (current title)' : ''}`}
                          className={`input resize-none ${validationErrors[`title-${index}`] ? 'input-error' : ''}`}
                          rows={2}
                          maxLength={100}
                        />
                        {validationErrors[`title-${index}`] && (
                          <p className="text-sm text-red-600 mt-1">{validationErrors[`title-${index}`]}</p>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {title.length}/100 characters
                        </div>
                      </div>
                      {formData.titleVariations.length > 2 && (
                        <button
                          onClick={() => removeTitleVariation(index)}
                          className="text-red-500 hover:text-red-700 mt-2 p-1 focus-ring rounded"
                          aria-label={`Remove title variation ${index + 1}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {formData.titleVariations.length < 6 && (
                  <button
                    onClick={addTitleVariation}
                    className="btn-outline mt-3"
                  >
                    Add Title Variation
                  </button>
                )}
              </div>

              {/* Campaign Settings */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Rotation Interval (hours)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={formData.rotationHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, rotationHours: parseInt(e.target.value) || 1 }))}
                    className={`input ${validationErrors.rotationHours ? 'input-error' : ''}`}
                  />
                  {validationErrors.rotationHours && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.rotationHours}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">How often to switch titles (1-24 hours)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Total Duration (hours)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="168"
                    value={formData.totalDurationHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalDurationHours: parseInt(e.target.value) || 6 }))}
                    className={`input ${validationErrors.totalDurationHours ? 'input-error' : ''}`}
                  />
                  {validationErrors.totalDurationHours && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.totalDurationHours}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">Total campaign duration (6 hours - 7 days)</p>
                </div>
              </div>

              {/* Start Time */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Campaign Start Time
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, startsAt: e.target.value }))}
                  className={`input ${validationErrors.startsAt ? 'input-error' : ''}`}
                  min={new Date().toISOString().slice(0, 16)}
                />
                {validationErrors.startsAt && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.startsAt}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">When to start the campaign (must be in the future)</p>
              </div>

              {/* Campaign Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Campaign Summary</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• {formData.titleVariations.filter(t => t.trim()).length} title variations</p>
                  <p>• Rotation every {formData.rotationHours} hour{formData.rotationHours !== 1 ? 's' : ''}</p>
                  <p>• Total duration: {formData.totalDurationHours} hours ({Math.round(formData.totalDurationHours / 24 * 10) / 10} days)</p>
                  <p>• Estimated {Math.floor(formData.totalDurationHours / formData.rotationHours)} rotations per title</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-900">Campaign Creation Failed</h4>
                      <p className="text-sm text-red-800 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          
          {step === 'campaign-setup' && (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner w-4 h-4 mr-2" />
                  Creating Campaign...
                </>
              ) : (
                'Create Campaign'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateCampaignModal