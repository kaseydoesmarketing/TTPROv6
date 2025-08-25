// System logging utility for TitleTesterPro v6
import { prisma } from '@/lib/prisma'
import { LogLevel } from '@prisma/client'

export class SystemLogger {
  static async log(
    level: LogLevel,
    category: string,
    message: string,
    metadata?: any,
    userId?: string,
    campaignId?: string
  ): Promise<void> {
    try {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        const timestamp = new Date().toISOString()
        console.log(`[${timestamp}] ${level} ${category}: ${message}`, metadata || '')
      }
      
      // Store in database
      await prisma.systemLog.create({
        data: {
          level,
          category,
          message,
          metadata: metadata ? JSON.stringify(metadata) : undefined,
          userId,
          campaignId,
        },
      })
    } catch (error) {
      // Fallback to console if database logging fails
      console.error('Failed to log to database:', error)
      console.log(`[FALLBACK] ${level} ${category}: ${message}`, metadata || '')
    }
  }
  
  static async debug(category: string, message: string, metadata?: any, userId?: string, campaignId?: string) {
    await this.log('DEBUG', category, message, metadata, userId, campaignId)
  }
  
  static async info(category: string, message: string, metadata?: any, userId?: string, campaignId?: string) {
    await this.log('INFO', category, message, metadata, userId, campaignId)
  }
  
  static async warn(category: string, message: string, metadata?: any, userId?: string, campaignId?: string) {
    await this.log('WARN', category, message, metadata, userId, campaignId)
  }
  
  static async error(category: string, message: string, metadata?: any, userId?: string, campaignId?: string) {
    await this.log('ERROR', category, message, metadata, userId, campaignId)
  }
  
  static async critical(category: string, message: string, metadata?: any, userId?: string, campaignId?: string) {
    await this.log('CRITICAL', category, message, metadata, userId, campaignId)
  }
}