// Campaign management - list, pause, resume, cancel
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyFirebaseToken } from '@/lib/auth/firebase-admin'
import { SystemLogger } from '@/lib/logging'

// GET - List user's campaigns
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const decodedToken = await verifyFirebaseToken(token)
    
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Get campaigns with recent rotations
    const campaigns = await prisma.campaign.findMany({
      where: { userId: user.id },
      include: {
        rotations: {
          orderBy: { activatedAt: 'desc' },
          take: 5, // Get latest 5 rotations for each campaign
        },
        _count: {
          select: { rotations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    // Calculate additional metrics for each campaign
    const campaignsWithMetrics = campaigns.map(campaign => {
      const activeRotations = campaign.rotations.filter(r => r.viewsPerHour !== null)
      const totalViews = activeRotations.reduce((sum, r) => sum + (r.viewsGained || 0), 0)
      const avgVph = activeRotations.length > 0 
        ? activeRotations.reduce((sum, r) => sum + (r.viewsPerHour || 0), 0) / activeRotations.length
        : 0
      
      return {
        id: campaign.id,
        videoId: campaign.videoId,
        videoTitle: campaign.videoTitle,
        originalTitle: campaign.originalTitle,
        thumbnailUrl: campaign.thumbnailUrl,
        status: campaign.status,
        titleVariations: campaign.titleVariations,
        rotationHours: campaign.rotationHours,
        totalDurationHours: campaign.totalDurationHours,
        currentTitle: campaign.currentTitle,
        currentTitleIndex: campaign.currentTitleIndex,
        nextRotationAt: campaign.nextRotationAt,
        startsAt: campaign.startsAt,
        endsAt: campaign.endsAt,
        completedAt: campaign.completedAt,
        pausedAt: campaign.pausedAt,
        winningTitle: campaign.winningTitle,
        winningVph: campaign.winningVph,
        improvementPercent: campaign.improvementPercent,
        confidenceLevel: campaign.confidenceLevel,
        totalViewsGained: campaign.totalViewsGained,
        lastError: campaign.lastError,
        errorCount: campaign.errorCount,
        consecutiveErrors: campaign.consecutiveErrors,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        // Calculated metrics
        rotationCount: campaign._count.rotations,
        recentRotations: campaign.rotations,
        currentTotalViews: totalViews,
        currentAvgVph: Math.round(avgVph * 100) / 100,
        progressPercent: Math.round(((Date.now() - campaign.startsAt.getTime()) / (campaign.endsAt.getTime() - campaign.startsAt.getTime())) * 100),
      }
    })
    
    return NextResponse.json({
      campaigns: campaignsWithMetrics,
      summary: {
        total: campaigns.length,
        active: campaigns.filter(c => c.status === 'ACTIVE').length,
        completed: campaigns.filter(c => c.status === 'COMPLETED').length,
        paused: campaigns.filter(c => c.status === 'PAUSED').length,
        error: campaigns.filter(c => c.status === 'ERROR').length,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    await SystemLogger.error('campaigns', 'Failed to list campaigns', {
      error: errorMessage,
    })
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// PATCH - Update campaign status (pause, resume, cancel)
export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const decodedToken = await verifyFirebaseToken(token)
    const body = await request.json()
    const { campaignId, action } = body
    
    if (!campaignId || !action) {
      return NextResponse.json({ 
        error: 'Campaign ID and action are required' 
      }, { status: 400 })
    }
    
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Verify campaign ownership
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId: user.id,
      },
    })
    
    if (!campaign) {
      return NextResponse.json({ 
        error: 'Campaign not found or access denied' 
      }, { status: 404 })
    }
    
    let updateData: any = {}
    const now = new Date()
    
    switch (action) {
      case 'pause':
        if (campaign.status !== 'ACTIVE') {
          return NextResponse.json({ 
            error: 'Can only pause active campaigns' 
          }, { status: 400 })
        }
        updateData = {
          status: 'PAUSED',
          pausedAt: now,
          nextRotationAt: null,
        }
        break
        
      case 'resume':
        if (campaign.status !== 'PAUSED') {
          return NextResponse.json({ 
            error: 'Can only resume paused campaigns' 
          }, { status: 400 })
        }
        // Check if campaign hasn't expired
        if (now >= campaign.endsAt) {
          updateData = {
            status: 'COMPLETED',
            completedAt: now,
          }
        } else {
          updateData = {
            status: 'ACTIVE',
            pausedAt: null,
            nextRotationAt: new Date(now.getTime() + campaign.rotationHours * 3600000),
            consecutiveErrors: 0, // Reset error count on resume
          }
        }
        break
        
      case 'cancel':
        if (!['ACTIVE', 'PAUSED', 'PENDING'].includes(campaign.status)) {
          return NextResponse.json({ 
            error: 'Cannot cancel completed or errored campaigns' 
          }, { status: 400 })
        }
        updateData = {
          status: 'CANCELLED',
          completedAt: now,
          nextRotationAt: null,
        }
        break
        
      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use pause, resume, or cancel' 
        }, { status: 400 })
    }
    
    // Update campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: updateData,
    })
    
    await SystemLogger.info('campaigns', `Campaign ${action} successful`, {
      campaignId,
      userId: user.id,
      action,
      previousStatus: campaign.status,
      newStatus: updatedCampaign.status,
    })
    
    return NextResponse.json({
      success: true,
      campaign: {
        id: updatedCampaign.id,
        status: updatedCampaign.status,
        pausedAt: updatedCampaign.pausedAt,
        completedAt: updatedCampaign.completedAt,
        nextRotationAt: updatedCampaign.nextRotationAt,
        updatedAt: updatedCampaign.updatedAt,
      },
      message: `Campaign ${action} successful`,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    await SystemLogger.error('campaigns', 'Campaign update failed', {
      error: errorMessage,
    })
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}