// YouTube API quota management with circuit breaker pattern
import { Redis } from '@upstash/redis'
import { prisma } from '@/lib/prisma'
import { SystemLogger } from '@/lib/logging'

export class QuotaManager {
  private static redis: Redis | null = null
  
  private static getRedis(): Redis {
    if (!this.redis) {
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.warn('Redis environment variables not configured')
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Redis configuration missing')
        }
        // Return mock Redis for build time
        return {
          get: async () => '0',
          incr: async () => 1,
          expire: async () => true,
          del: async () => 1,
        } as any
      }
      
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
    }
    
    return this.redis
  }
  
  private static readonly DAILY_QUOTA = parseInt(process.env.YOUTUBE_DAILY_QUOTA || '10000')
  private static readonly WARNING_THRESHOLD = parseInt(process.env.QUOTA_WARNING_THRESHOLD || '9000')
  private static readonly CIRCUIT_BREAKER_THRESHOLD = parseInt(process.env.QUOTA_CIRCUIT_BREAKER_THRESHOLD || '9500')
  
  private static readonly COSTS = {
    'videos.list': 1,
    'videos.update': 50,
    'search.list': 100,
    'channels.list': 1,
  } as const
  
  // Check if operation is allowed before execution
  static async checkQuota(operation: keyof typeof QuotaManager.COSTS): Promise<{
    allowed: boolean
    currentUsage: number
    remainingQuota: number
    circuitBreakerActive: boolean
    projectedUsage: number
  }> {
    const today = new Date().toISOString().split('T')[0]
    const cacheKey = `quota:${today}`
    
    try {
      // Get current usage from Redis (fast cache)
      let currentUsage = await this.getRedis().get<number>(cacheKey) || 0
      
      // Fallback to database if Redis is empty
      if (currentUsage === 0) {
        const dbQuota = await prisma.quotaUsage.findUnique({
          where: { date: new Date(today) },
        })
        currentUsage = dbQuota?.totalUnitsUsed || 0
        
        // Cache in Redis with 24-hour expiry
        await this.getRedis().set(cacheKey, currentUsage, { ex: 86400 })
      }
      
      const operationCost = this.COSTS[operation]
      const projectedUsage = currentUsage + operationCost
      const remainingQuota = this.DAILY_QUOTA - currentUsage
      
      // Circuit breaker logic
      const circuitBreakerActive = currentUsage >= this.CIRCUIT_BREAKER_THRESHOLD
      const allowed = !circuitBreakerActive && projectedUsage <= this.DAILY_QUOTA
      
      // Log warning if approaching limit
      if (currentUsage >= this.WARNING_THRESHOLD && currentUsage < this.CIRCUIT_BREAKER_THRESHOLD) {
        await SystemLogger.warn('quota', 'Approaching daily quota limit', {
          currentUsage,
          remainingQuota,
          threshold: this.WARNING_THRESHOLD,
          operation,
        })
      }
      
      // Log circuit breaker activation
      if (circuitBreakerActive && currentUsage === this.CIRCUIT_BREAKER_THRESHOLD) {
        await SystemLogger.critical('quota', 'Circuit breaker activated - API calls stopped', {
          currentUsage,
          threshold: this.CIRCUIT_BREAKER_THRESHOLD,
          operation,
        })
        
        // Update database to reflect circuit breaker state
        await prisma.quotaUsage.upsert({
          where: { date: new Date(today) },
          update: { circuitBreakerTripped: true },
          create: {
            date: new Date(today),
            totalUnitsUsed: currentUsage,
            circuitBreakerTripped: true,
          },
        })
      }
      
      return {
        allowed,
        currentUsage,
        remainingQuota,
        circuitBreakerActive,
        projectedUsage,
      }
    } catch (error) {
      await SystemLogger.error('quota', 'Quota check failed', {
        operation,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      // Fail safe - deny operation if quota check fails
      return {
        allowed: false,
        currentUsage: 0,
        remainingQuota: 0,
        circuitBreakerActive: true,
        projectedUsage: 0,
      }
    }
  }
  
  // Record usage after successful API call
  static async recordUsage(operation: keyof typeof QuotaManager.COSTS): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    const cost = this.COSTS[operation]
    const cacheKey = `quota:${today}`
    
    try {
      // Update Redis cache (atomic increment)
      const newUsage = await this.getRedis().incrby(cacheKey, cost)
      
      // Ensure cache has expiry
      await this.getRedis().expire(cacheKey, 86400)
      
      // Update database
      const fieldMap: Record<string, string> = {
        'videos.list': 'videoListCalls',
        'videos.update': 'videoUpdateCalls',
        'search.list': 'searchListCalls',
        'channels.list': 'channelListCalls',
      }
      
      const fieldToIncrement = fieldMap[operation] || 'videoListCalls'
      
      await prisma.quotaUsage.upsert({
        where: { date: new Date(today) },
        update: {
          totalUnitsUsed: newUsage,
          [fieldToIncrement]: { increment: 1 },
        },
        create: {
          date: new Date(today),
          totalUnitsUsed: cost,
          [fieldToIncrement]: 1,
        },
      })
      
      await SystemLogger.debug('quota', 'Usage recorded', {
        operation,
        cost,
        newUsage,
      })
    } catch (error) {
      await SystemLogger.error('quota', 'Failed to record usage', {
        operation,
        cost,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      throw error
    }
  }
  
  // Check user-specific limits
  static async checkUserLimits(userId: string): Promise<{
    canCreateCampaign: boolean
    canChangeTitle: boolean
    remainingCampaigns: number
    remainingTitleChanges: number
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          campaigns: {
            where: { status: 'ACTIVE' },
          },
        },
      })
      
      if (!user) {
        throw new Error('User not found')
      }
      
      // Reset daily limits if needed (new day)
      const now = new Date()
      const lastReset = new Date(user.lastQuotaReset)
      
      if (now.toDateString() !== lastReset.toDateString()) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            dailyApiUnitsUsed: 0,
            dailyTitleChanges: 0,
            lastQuotaReset: now,
          },
        })
        
        return {
          canCreateCampaign: true,
          canChangeTitle: true,
          remainingCampaigns: user.maxDailyCampaigns,
          remainingTitleChanges: parseInt(process.env.MAX_TITLE_CHANGES_PER_USER_PER_DAY || '10'),
        }
      }
      
      const maxTitleChanges = parseInt(process.env.MAX_TITLE_CHANGES_PER_USER_PER_DAY || '10')
      
      return {
        canCreateCampaign: user.campaigns.length < user.maxDailyCampaigns,
        canChangeTitle: user.dailyTitleChanges < maxTitleChanges,
        remainingCampaigns: user.maxDailyCampaigns - user.campaigns.length,
        remainingTitleChanges: maxTitleChanges - user.dailyTitleChanges,
      }
    } catch (error) {
      await SystemLogger.error('quota', 'User limits check failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      throw error
    }
  }
  
  // Get current quota status
  static async getQuotaStatus(): Promise<{
    totalQuota: number
    currentUsage: number
    remainingQuota: number
    warningThreshold: number
    circuitBreakerThreshold: number
    circuitBreakerActive: boolean
  }> {
    const today = new Date().toISOString().split('T')[0]
    const cacheKey = `quota:${today}`
    
    try {
      // Get from Redis first
      let currentUsage = await this.getRedis().get<number>(cacheKey) || 0
      
      // Check database if Redis is empty
      if (currentUsage === 0) {
        const dbQuota = await prisma.quotaUsage.findUnique({
          where: { date: new Date(today) },
        })
        currentUsage = dbQuota?.totalUnitsUsed || 0
      }
      
      return {
        totalQuota: this.DAILY_QUOTA,
        currentUsage,
        remainingQuota: this.DAILY_QUOTA - currentUsage,
        warningThreshold: this.WARNING_THRESHOLD,
        circuitBreakerThreshold: this.CIRCUIT_BREAKER_THRESHOLD,
        circuitBreakerActive: currentUsage >= this.CIRCUIT_BREAKER_THRESHOLD,
      }
    } catch (error) {
      await SystemLogger.error('quota', 'Quota status check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      return {
        totalQuota: this.DAILY_QUOTA,
        currentUsage: 0,
        remainingQuota: this.DAILY_QUOTA,
        warningThreshold: this.WARNING_THRESHOLD,
        circuitBreakerThreshold: this.CIRCUIT_BREAKER_THRESHOLD,
        circuitBreakerActive: false,
      }
    }
  }
  
  // Reset quota (for testing or manual reset)
  static async resetQuota(): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    const cacheKey = `quota:${today}`
    
    try {
      // Clear Redis cache
      await this.getRedis().del(cacheKey)
      
      // Reset database entry
      await prisma.quotaUsage.upsert({
        where: { date: new Date(today) },
        update: {
          totalUnitsUsed: 0,
          videoListCalls: 0,
          videoUpdateCalls: 0,
          circuitBreakerTripped: false,
        },
        create: {
          date: new Date(today),
          totalUnitsUsed: 0,
        },
      })
      
      await SystemLogger.info('quota', 'Quota reset successfully', { date: today })
    } catch (error) {
      await SystemLogger.error('quota', 'Quota reset failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      throw error
    }
  }
}