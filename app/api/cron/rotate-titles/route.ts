// Core rotation logic with bulletproof snapshotting and error handling
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { YouTubeClient } from '@/lib/youtube/client'
import { QuotaManager } from '@/lib/youtube/quota-manager'
import { LockManager } from '@/lib/redis/lock-manager'
import { SystemLogger } from '@/lib/logging'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    await SystemLogger.error('cron', 'Unauthorized cron access attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const startTime = Date.now()
  const results = {
    processed: 0,
    failed: 0,
    skipped: 0,
    errors: [] as string[],
  }
  
  try {
    // Check if circuit breaker is active globally
    const quotaStatus = await QuotaManager.checkQuota('videos.list')
    if (quotaStatus.circuitBreakerActive) {
      await SystemLogger.warn('cron', 'Rotation job skipped - circuit breaker active', {
        currentUsage: quotaStatus.currentUsage,
        threshold: quotaStatus.circuitBreakerActive,
      })
      
      return NextResponse.json({
        message: 'Circuit breaker active - skipping all rotations',
        quotaStatus,
      })
    }
    
    // Find campaigns due for rotation
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: 'ACTIVE',
        nextRotationAt: {
          lte: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            youtubeAccessToken: true,
            youtubeRefreshToken: true,
            youtubeConnectionValid: true,
          },
        },
        rotations: {
          orderBy: { activatedAt: 'desc' },
          take: 1,
        },
      },
    })
    
    await SystemLogger.info('cron', 'Starting rotation job', {
      campaignsFound: campaigns.length,
      quotaRemaining: quotaStatus.remainingQuota,
    })
    
    // Process each campaign with distributed locking
    for (const campaign of campaigns) {
      const lock = await LockManager.acquireLock(`campaign:${campaign.id}`)
      
      if (!lock.acquired) {
        results.skipped++
        await SystemLogger.warn('cron', 'Campaign locked, skipping rotation', {
          campaignId: campaign.id,
        })
        continue
      }
      
      try {
        await processRotation(campaign)
        results.processed++
        
        await SystemLogger.info('cron', 'Campaign rotation completed', {
          campaignId: campaign.id,
          videoId: campaign.videoId,
        })
      } catch (error) {
        results.failed++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(`Campaign ${campaign.id}: ${errorMessage}`)
        
        // Update campaign error tracking
        const consecutiveErrors = campaign.consecutiveErrors + 1
        
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            errorCount: { increment: 1 },
            consecutiveErrors,
            lastError: errorMessage,
            // Pause campaign after 3 consecutive errors
            ...(consecutiveErrors >= 3 && {
              status: 'ERROR',
              pausedAt: new Date(),
            }),
          },
        })
        
        await SystemLogger.error('cron', 'Campaign rotation failed', {
          campaignId: campaign.id,
          error: errorMessage,
          consecutiveErrors,
        })
        
        // Pause campaign if too many consecutive errors
        if (consecutiveErrors >= 3) {
          await SystemLogger.critical('campaign', 'Campaign auto-paused due to errors', {
            campaignId: campaign.id,
            errorCount: consecutiveErrors,
          })
        }
      } finally {
        // Always release the lock
        await LockManager.releaseLock(`campaign:${campaign.id}`, lock.lockId)
      }
    }
    
    const duration = Date.now() - startTime
    
    await SystemLogger.info('cron', 'Rotation job completed', {
      processed: results.processed,
      failed: results.failed,
      skipped: results.skipped,
      duration,
      quotaUsed: quotaStatus.currentUsage,
    })
    
    return NextResponse.json({
      success: true,
      ...results,
      duration,
      quotaStatus: await QuotaManager.getQuotaStatus(),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    await SystemLogger.critical('cron', 'Rotation job failed catastrophically', {
      error: errorMessage,
      duration: Date.now() - startTime,
    })
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      ...results,
    }, { status: 500 })
  }
}

async function processRotation(campaign: any) {
  // Initialize YouTube client with user tokens
  const youtube = new YouTubeClient(
    campaign.userId,
    campaign.user.youtubeAccessToken,
    campaign.user.youtubeRefreshToken
  )
  
  // Step 1: Check quota allowance for this operation
  const quotaCheck = await QuotaManager.checkQuota('videos.update')
  if (!quotaCheck.allowed) {
    // Update campaign status to quota exceeded
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: 'QUOTA_EXCEEDED',
        lastError: `Quota exceeded: ${quotaCheck.remainingQuota} units remaining`,
        pausedAt: new Date(),
      },
    })
    throw new Error('Quota exceeded for this campaign')
  }
  
  // Step 2: Snapshot current view count BEFORE rotation
  let currentViewCount: number
  try {
    currentViewCount = await youtube.getVideoViewCount(campaign.videoId)
  } catch (error) {
    throw new Error(`Failed to get video view count: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  // Step 3: Finalize previous rotation with accurate timing and VPH calculation
  const previousRotation = campaign.rotations[0]
  if (previousRotation && !previousRotation.deactivatedAt) {
    const now = new Date()
    const durationSeconds = Math.floor(
      (now.getTime() - previousRotation.activatedAt.getTime()) / 1000
    )
    
    // Calculate views gained and VPH
    const viewsGained = Math.max(0, currentViewCount - previousRotation.viewsStart)
    const viewsPerHour = durationSeconds > 0 ? (viewsGained / durationSeconds) * 3600 : 0
    
    await prisma.rotation.update({
      where: { id: previousRotation.id },
      data: {
        deactivatedAt: now,
        durationSeconds,
        viewsEnd: currentViewCount,
        viewsGained,
        viewsPerHour,
        snapshotSuccess: true,
      },
    })
    
    await SystemLogger.debug('rotation', 'Previous rotation finalized', {
      campaignId: campaign.id,
      rotationId: previousRotation.id,
      durationSeconds,
      viewsGained,
      viewsPerHour,
    })
  }
  
  // Step 4: Check if campaign should end
  const now = new Date()
  if (now >= campaign.endsAt) {
    await finalizeCampaign(campaign)
    return
  }
  
  // Step 5: Calculate next title in rotation
  const titleVariations = campaign.titleVariations as string[]
  const nextIndex = (campaign.currentTitleIndex + 1) % titleVariations.length
  const nextTitle = titleVariations[nextIndex]
  
  // Step 6: Update YouTube video title
  try {
    await youtube.updateVideoTitle(campaign.videoId, nextTitle)
  } catch (error) {
    throw new Error(`Failed to update video title: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  // Step 7: Create new rotation record with current view count as start
  await prisma.rotation.create({
    data: {
      campaignId: campaign.id,
      title: nextTitle,
      titleIndex: nextIndex,
      viewsStart: currentViewCount, // CRITICAL: Same snapshot becomes start point
      youtubeUpdateSuccess: true,
      snapshotSuccess: true,
    },
  })
  
  // Step 8: Update campaign state and schedule next rotation
  const nextRotationAt = new Date(now.getTime() + campaign.rotationHours * 3600000)
  const shouldScheduleNext = nextRotationAt < campaign.endsAt
  
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      currentTitleIndex: nextIndex,
      currentTitle: nextTitle,
      nextRotationAt: shouldScheduleNext ? nextRotationAt : null,
      consecutiveErrors: 0, // Reset on successful rotation
      updatedAt: now,
    },
  })
  
  // Step 9: Update user quota tracking
  await prisma.user.update({
    where: { id: campaign.userId },
    data: {
      dailyTitleChanges: { increment: 1 },
      dailyApiUnitsUsed: { increment: 51 }, // 50 for update + 1 for list
    },
  })
  
  await SystemLogger.info('rotation', 'Title rotation completed successfully', {
    campaignId: campaign.id,
    videoId: campaign.videoId,
    newTitle: nextTitle,
    titleIndex: nextIndex,
    viewsAtRotation: currentViewCount,
    nextRotationAt: shouldScheduleNext ? nextRotationAt : null,
  })
}

async function finalizeCampaign(campaign: any) {
  // Get all completed rotations for analysis
  const rotations = await prisma.rotation.findMany({
    where: { 
      campaignId: campaign.id,
      viewsPerHour: { not: null },
      durationSeconds: { gt: 3600 }, // Only rotations longer than 1 hour
    },
    orderBy: { viewsPerHour: 'desc' },
  })
  
  if (rotations.length === 0) {
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        lastError: 'Insufficient data for analysis',
      },
    })
    
    await SystemLogger.warn('campaign', 'Campaign completed with no valid rotation data', {
      campaignId: campaign.id,
    })
    return
  }
  
  // Calculate performance by title (aggregate multiple rotations per title)
  const titlePerformance = rotations.reduce((acc, rotation) => {
    if (!acc[rotation.title]) {
      acc[rotation.title] = {
        totalVph: 0,
        count: 0,
        bestVph: 0,
        titleIndex: rotation.titleIndex,
        totalViews: 0,
      }
    }
    
    const vph = rotation.viewsPerHour || 0
    const views = rotation.viewsGained || 0
    
    acc[rotation.title].totalVph += vph
    acc[rotation.title].count++
    acc[rotation.title].bestVph = Math.max(acc[rotation.title].bestVph, vph)
    acc[rotation.title].totalViews += views
    
    return acc
  }, {} as Record<string, any>)
  
  // Rank titles by average VPH
  const titleResults = Object.entries(titlePerformance)
    .map(([title, stats]) => ({
      title,
      avgVph: stats.totalVph / stats.count,
      bestVph: stats.bestVph,
      titleIndex: stats.titleIndex,
      sampleSize: stats.count,
      totalViews: stats.totalViews,
    }))
    .sort((a, b) => b.avgVph - a.avgVph)
  
  const winner = titleResults[0]
  const runnerUp = titleResults[1]
  
  // Calculate improvement percentage
  const improvementPercent = runnerUp && runnerUp.avgVph > 0
    ? ((winner.avgVph - runnerUp.avgVph) / runnerUp.avgVph) * 100 
    : 0
  
  // Calculate confidence level based on sample size and consistency
  const totalSamples = rotations.length
  const winnerConsistency = winner.sampleSize >= 2 ? 
    (winner.avgVph / winner.bestVph) : 1
  const confidence = Math.min(95, 50 + (totalSamples * 3) + (winnerConsistency * 10))
  
  // Calculate total views gained across all rotations
  const totalViewsGained = rotations.reduce((sum, r) => sum + (r.viewsGained || 0), 0)
  
  // Update campaign with final results
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      winningTitle: winner.title,
      winningTitleIndex: winner.titleIndex,
      winningVph: Math.round(winner.avgVph * 100) / 100, // Round to 2 decimals
      improvementPercent: Math.round(improvementPercent * 100) / 100,
      confidenceLevel: Math.round(confidence),
      totalViewsGained,
    },
  })
  
  await SystemLogger.info('campaign', 'Campaign finalized with results', {
    campaignId: campaign.id,
    winningTitle: winner.title,
    avgVph: winner.avgVph,
    improvement: `${improvementPercent.toFixed(1)}%`,
    confidence: `${confidence.toFixed(0)}%`,
    totalViews: totalViewsGained,
    samplesAnalyzed: totalSamples,
  })
}