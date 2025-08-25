// Campaign creation with comprehensive validation and error handling
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyFirebaseToken } from '@/lib/auth/firebase-admin'
import { YouTubeClient } from '@/lib/youtube/client'
import { QuotaManager } from '@/lib/youtube/quota-manager'
import { SystemLogger } from '@/lib/logging'

const CreateCampaignSchema = z.object({
  videoId: z.string().length(11, 'YouTube video ID must be 11 characters'),
  titleVariations: z
    .array(z.string().min(1).max(100))
    .min(2, 'Must provide at least 2 title variations')
    .max(5, 'Maximum 5 title variations allowed'),
  rotationHours: z
    .number()
    .min(1, 'Rotation interval must be at least 1 hour')
    .max(24, 'Rotation interval cannot exceed 24 hours'),
  totalDurationHours: z
    .number()
    .min(6, 'Campaign must run for at least 6 hours')
    .max(168, 'Campaign cannot run longer than 1 week'),
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user with Firebase token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const decodedToken = await verifyFirebaseToken(token)
    
    // Get user with campaigns and connection status
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: {
        campaigns: {
          where: { 
            status: { in: ['ACTIVE', 'PENDING'] }
          },
        },
      },
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Validate YouTube connection
    if (!user.youtubeConnectionValid || !user.youtubeAccessToken || !user.youtubeRefreshToken) {
      return NextResponse.json({ 
        error: 'YouTube account not connected. Please connect your YouTube channel first.' 
      }, { status: 400 })
    }
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData = CreateCampaignSchema.parse(body)
    
    // Check user limits
    const userLimits = await QuotaManager.checkUserLimits(user.id)
    if (!userLimits.canCreateCampaign) {
      return NextResponse.json({
        error: `Campaign limit reached. You can create ${userLimits.remainingCampaigns} more campaigns today.`,
        limits: userLimits,
      }, { status: 429 })
    }
    
    // Check global quota status
    const quotaCheck = await QuotaManager.checkQuota('videos.update')
    if (!quotaCheck.allowed) {
      return NextResponse.json({
        error: 'YouTube API quota exceeded. Please try again tomorrow.',
        quota: {
          current: quotaCheck.currentUsage,
          remaining: quotaCheck.remainingQuota,
          circuitBreakerActive: quotaCheck.circuitBreakerActive,
        },
      }, { status: 429 })
    }
    
    // Initialize YouTube client for this user
    const youtube = new YouTubeClient(
      user.id, 
      user.youtubeAccessToken, 
      user.youtubeRefreshToken
    )
    
    // Validate video exists and get details
    let videoDetails
    try {
      videoDetails = await youtube.getVideoDetails(validatedData.videoId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      if (errorMessage.includes('Video not found')) {
        return NextResponse.json({
          error: 'Video not found. Please check the video ID and ensure it belongs to your channel.',
        }, { status: 404 })
      }
      
      if (errorMessage.includes('Quota exceeded')) {
        return NextResponse.json({
          error: 'YouTube API quota exceeded while validating video.',
        }, { status: 429 })
      }
      
      throw error
    }
    
    // Get initial view count for baseline
    let initialViewCount
    try {
      initialViewCount = await youtube.getVideoViewCount(validatedData.videoId)
    } catch (error) {
      throw new Error(`Failed to get initial view count: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    // Create campaign with initial state
    const campaign = await prisma.campaign.create({
      data: {
        userId: user.id,
        videoId: validatedData.videoId,
        videoTitle: videoDetails.title,
        originalTitle: videoDetails.title,
        thumbnailUrl: videoDetails.thumbnail,
        channelId: videoDetails.channelId,
        titleVariations: validatedData.titleVariations,
        rotationHours: validatedData.rotationHours,
        totalDurationHours: validatedData.totalDurationHours,
        status: 'ACTIVE',
        currentTitleIndex: 0,
        currentTitle: validatedData.titleVariations[0],
        nextRotationAt: new Date(Date.now() + validatedData.rotationHours * 3600000),
        endsAt: new Date(Date.now() + validatedData.totalDurationHours * 3600000),
      },
    })
    
    // Apply first title variation immediately
    try {
      await youtube.updateVideoTitle(validatedData.videoId, validatedData.titleVariations[0])
    } catch (error) {
      // If title update fails, delete the campaign and return error
      await prisma.campaign.delete({ where: { id: campaign.id } })
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await SystemLogger.error('campaign', 'Failed to apply initial title', {
        campaignId: campaign.id,
        userId: user.id,
        videoId: validatedData.videoId,
        error: errorMessage,
      })
      
      return NextResponse.json({
        error: `Failed to apply first title: ${errorMessage}`,
      }, { status: 500 })
    }
    
    // Create first rotation record
    await prisma.rotation.create({
      data: {
        campaignId: campaign.id,
        title: validatedData.titleVariations[0],
        titleIndex: 0,
        viewsStart: initialViewCount,
        youtubeUpdateSuccess: true,
        snapshotSuccess: true,
      },
    })
    
    // Update user usage counters
    await prisma.user.update({
      where: { id: user.id },
      data: {
        dailyTitleChanges: { increment: 1 },
        dailyApiUnitsUsed: { increment: 51 }, // 50 for update + 1 for details
      },
    })
    
    await SystemLogger.info('campaign', 'Campaign created successfully', {
      campaignId: campaign.id,
      userId: user.id,
      videoId: validatedData.videoId,
      videoTitle: videoDetails.title,
      titleVariations: validatedData.titleVariations.length,
      rotationHours: validatedData.rotationHours,
      totalDurationHours: validatedData.totalDurationHours,
      initialViewCount,
    })
    
    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        videoId: campaign.videoId,
        videoTitle: campaign.videoTitle,
        thumbnailUrl: campaign.thumbnailUrl,
        status: campaign.status,
        titleVariations: campaign.titleVariations,
        rotationHours: campaign.rotationHours,
        totalDurationHours: campaign.totalDurationHours,
        currentTitle: campaign.currentTitle,
        nextRotationAt: campaign.nextRotationAt,
        endsAt: campaign.endsAt,
        createdAt: campaign.createdAt,
      },
      quotaUsed: {
        units: 51,
        remaining: quotaCheck.remainingQuota - 51,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    await SystemLogger.error('campaign', 'Campaign creation failed', {
      error: errorMessage,
      body: await request.json().catch(() => null),
    })
    
    // Handle validation errors specifically
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      }, { status: 400 })
    }
    
    return NextResponse.json({
      error: errorMessage,
    }, { status: 500 })
  }
}