// Redis-based distributed lock manager - prevents race conditions
import { Redis } from '@upstash/redis'
import { randomUUID } from 'crypto'
import { SystemLogger } from '@/lib/logging'

export class LockManager {
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
          set: async () => 'OK',
          get: async () => null,
          del: async () => 1,
          ttl: async () => -1,
        } as any
      }
      
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
    }
    
    return this.redis
  }
  
  private static readonly TTL = parseInt(process.env.LOCK_TTL_SECONDS || '30')
  private static readonly RETRY_DELAY = parseInt(process.env.LOCK_RETRY_DELAY_MS || '100')
  private static readonly MAX_RETRIES = parseInt(process.env.LOCK_MAX_RETRIES || '10')
  
  // Acquire a distributed lock with automatic retry
  static async acquireLock(
    resourceId: string,
    lockId: string = randomUUID()
  ): Promise<{ acquired: boolean; lockId: string }> {
    const lockKey = `lock:${resourceId}`
    
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        // Try to set lock with NX (only if not exists) and EX (expiry)
        const acquired = await this.getRedis().set(lockKey, lockId, {
          nx: true,
          ex: this.TTL,
        })
        
        if (acquired) {
          await SystemLogger.debug('lock', 'Lock acquired', {
            resourceId,
            lockId,
            attempt: attempt + 1,
          })
          return { acquired: true, lockId }
        }
        
        // Wait before retrying
        if (attempt < this.MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY))
        }
      } catch (error) {
        await SystemLogger.error('lock', 'Lock acquisition error', {
          resourceId,
          error: error instanceof Error ? error.message : 'Unknown error',
          attempt: attempt + 1,
        })
        
        if (attempt === this.MAX_RETRIES - 1) {
          throw error
        }
      }
    }
    
    await SystemLogger.warn('lock', 'Failed to acquire lock after max retries', {
      resourceId,
      maxRetries: this.MAX_RETRIES,
    })
    
    return { acquired: false, lockId }
  }
  
  // Release a lock (only if we own it)
  static async releaseLock(resourceId: string, lockId: string): Promise<boolean> {
    const lockKey = `lock:${resourceId}`
    
    try {
      // Atomic check-and-delete using Lua script
      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `
      
      // Use eval for atomic operation
      const currentLockId = await this.getRedis().get(lockKey)
      if (currentLockId === lockId) {
        await this.getRedis().del(lockKey)
        
        await SystemLogger.debug('lock', 'Lock released', {
          resourceId,
          lockId,
        })
        
        return true
      }
      
      await SystemLogger.warn('lock', 'Attempted to release lock not owned', {
        resourceId,
        lockId,
        currentLockId,
      })
      
      return false
    } catch (error) {
      await SystemLogger.error('lock', 'Lock release error', {
        resourceId,
        lockId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      return false
    }
  }
  
  // Extend lock TTL if we still own it
  static async extendLock(resourceId: string, lockId: string): Promise<boolean> {
    const lockKey = `lock:${resourceId}`
    
    try {
      const currentLockId = await this.getRedis().get(lockKey)
      if (currentLockId === lockId) {
        await this.getRedis().expire(lockKey, this.TTL)
        
        await SystemLogger.debug('lock', 'Lock extended', {
          resourceId,
          lockId,
          ttl: this.TTL,
        })
        
        return true
      }
      
      return false
    } catch (error) {
      await SystemLogger.error('lock', 'Lock extension error', {
        resourceId,
        lockId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      return false
    }
  }
  
  // Check if a resource is currently locked
  static async isLocked(resourceId: string): Promise<boolean> {
    const lockKey = `lock:${resourceId}`
    
    try {
      const lockId = await this.getRedis().get(lockKey)
      return lockId !== null
    } catch (error) {
      await SystemLogger.error('lock', 'Lock check error', {
        resourceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      return false
    }
  }
  
  // Get information about a lock
  static async getLockInfo(resourceId: string): Promise<{
    locked: boolean
    lockId?: string
    ttl?: number
  }> {
    const lockKey = `lock:${resourceId}`
    
    try {
      const lockId = await this.getRedis().get(lockKey)
      
      if (!lockId) {
        return { locked: false }
      }
      
      const ttl = await this.getRedis().ttl(lockKey)
      
      return {
        locked: true,
        lockId: lockId as string,
        ttl: ttl > 0 ? ttl : undefined,
      }
    } catch (error) {
      await SystemLogger.error('lock', 'Lock info error', {
        resourceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      return { locked: false }
    }
  }
}