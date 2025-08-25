// YouTube API client with bulletproof token refresh and quota management
import { google, youtube_v3 } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import CryptoJS from 'crypto-js'
import { prisma } from '@/lib/prisma'
import { SystemLogger } from '@/lib/logging'
import { QuotaManager } from './quota-manager'

export class YouTubeClient {
  private oauth2Client: OAuth2Client
  private youtube: youtube_v3.Youtube
  private userId: string
  
  constructor(userId: string, accessToken?: string, refreshToken?: string) {
    this.userId = userId
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`
    )
    
    if (accessToken && refreshToken) {
      this.oauth2Client.setCredentials({
        access_token: this.decrypt(accessToken),
        refresh_token: this.decrypt(refreshToken),
      })
    }
    
    this.youtube = google.youtube({ version: 'v3', auth: this.oauth2Client })
  }
  
  private decrypt(text: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(text, process.env.ENCRYPTION_KEY!)
      return bytes.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      // Log error synchronously - don't await in sync function
      SystemLogger.error('youtube', 'Token decryption failed', {
        userId: this.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw new Error('Token decryption failed')
    }
  }
  
  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, process.env.ENCRYPTION_KEY!).toString()
  }
  
  // CRITICAL: Proactive token refresh before EVERY API call
  async ensureValidToken(): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: this.userId },
        select: {
          youtubeTokenExpiry: true,
          youtubeRefreshToken: true,
          youtubeConnectionValid: true,
        },
      })
      
      if (!user?.youtubeRefreshToken) {
        throw new Error('No YouTube refresh token. User must reconnect.')
      }
      
      if (!user.youtubeConnectionValid) {
        throw new Error('YouTube connection invalid. User must reconnect.')
      }
      
      const now = new Date()
      const expiry = user.youtubeTokenExpiry
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)
      
      // Refresh if expired or expiring soon
      if (!expiry || expiry <= fiveMinutesFromNow) {
        try {
          this.oauth2Client.setCredentials({
            refresh_token: this.decrypt(user.youtubeRefreshToken),
          })
          
          const { credentials } = await this.oauth2Client.refreshAccessToken()
          
          if (!credentials.access_token) {
            throw new Error('Failed to refresh access token')
          }
          
          // Update database with new token
          await prisma.user.update({
            where: { id: this.userId },
            data: {
              youtubeAccessToken: this.encrypt(credentials.access_token),
              youtubeTokenExpiry: new Date(credentials.expiry_date!),
            },
          })
          
          // Update client credentials
          this.oauth2Client.setCredentials(credentials)
          
          await SystemLogger.info('youtube', 'Token refreshed successfully', {
            userId: this.userId,
            expiryDate: new Date(credentials.expiry_date!),
          })
        } catch (error) {
          // Mark connection as invalid on refresh failure
          await prisma.user.update({
            where: { id: this.userId },
            data: { youtubeConnectionValid: false },
          })
          
          await SystemLogger.error('youtube', 'Token refresh failed', {
            userId: this.userId,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          
          throw new Error('Failed to refresh YouTube token. User must reconnect.')
        }
      }
    } catch (error) {
      await SystemLogger.error('youtube', 'Token validation failed', {
        userId: this.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }
  
  // Get current view count with quota checking and snapshotting
  async getVideoViewCount(videoId: string): Promise<number> {
    // Check quota before making API call
    const quotaCheck = await QuotaManager.checkQuota('videos.list')
    if (!quotaCheck.allowed) {
      throw new Error(`Quota exceeded: ${quotaCheck.remainingQuota} units remaining`)
    }
    
    await this.ensureValidToken()
    
    try {
      const response = await this.youtube.videos.list({
        part: ['statistics'],
        id: [videoId],
      })
      
      // Record quota usage after successful call
      await QuotaManager.recordUsage('videos.list')
      
      if (!response.data.items?.length) {
        throw new Error('Video not found')
      }
      
      const viewCount = parseInt(response.data.items[0].statistics?.viewCount || '0')
      
      await SystemLogger.debug('youtube', 'View count retrieved', {
        userId: this.userId,
        videoId,
        viewCount,
      })
      
      return viewCount
    } catch (error) {
      await SystemLogger.error('youtube', 'Get view count failed', {
        userId: this.userId,
        videoId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }
  
  // Update video title with comprehensive error handling
  async updateVideoTitle(videoId: string, newTitle: string): Promise<void> {
    // Check quota before making API call
    const quotaCheck = await QuotaManager.checkQuota('videos.update')
    if (!quotaCheck.allowed) {
      throw new Error(`Quota exceeded: ${quotaCheck.remainingQuota} units remaining`)
    }
    
    await this.ensureValidToken()
    
    try {
      // First get current snippet to preserve other fields
      const videoResponse = await this.youtube.videos.list({
        part: ['snippet'],
        id: [videoId],
      })
      
      if (!videoResponse.data.items?.length) {
        throw new Error('Video not found')
      }
      
      const currentSnippet = videoResponse.data.items[0].snippet!
      
      // Update only the title, preserving all other fields
      await this.youtube.videos.update({
        part: ['snippet'],
        requestBody: {
          id: videoId,
          snippet: {
            ...currentSnippet,
            title: newTitle,
            categoryId: currentSnippet.categoryId || '22', // Default to People & Blogs
          },
        },
      })
      
      // Record quota usage after successful call
      await QuotaManager.recordUsage('videos.update')
      
      await SystemLogger.info('youtube', 'Video title updated successfully', {
        userId: this.userId,
        videoId,
        newTitle,
        previousTitle: currentSnippet.title,
      })
    } catch (error) {
      await SystemLogger.error('youtube', 'Video title update failed', {
        userId: this.userId,
        videoId,
        newTitle,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }
  
  // Get video details for campaign creation
  async getVideoDetails(videoId: string): Promise<{
    title: string
    thumbnail: string
    channelId: string
    channelTitle: string
  }> {
    const quotaCheck = await QuotaManager.checkQuota('videos.list')
    if (!quotaCheck.allowed) {
      throw new Error(`Quota exceeded: ${quotaCheck.remainingQuota} units remaining`)
    }
    
    await this.ensureValidToken()
    
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet'],
        id: [videoId],
      })
      
      await QuotaManager.recordUsage('videos.list')
      
      if (!response.data.items?.length) {
        throw new Error('Video not found')
      }
      
      const snippet = response.data.items[0].snippet!
      
      return {
        title: snippet.title!,
        thumbnail: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
        channelId: snippet.channelId!,
        channelTitle: snippet.channelTitle || '',
      }
    } catch (error) {
      await SystemLogger.error('youtube', 'Get video details failed', {
        userId: this.userId,
        videoId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }
  
  // Get channel videos for selection
  async getChannelVideos(maxResults: number = 50): Promise<Array<{
    videoId: string
    title: string
    publishedAt: string
    thumbnail: string
  }>> {
    const quotaCheck = await QuotaManager.checkQuota('search.list')
    if (!quotaCheck.allowed) {
      throw new Error(`Quota exceeded: ${quotaCheck.remainingQuota} units remaining`)
    }
    
    await this.ensureValidToken()
    
    try {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        forMine: true,
        type: ['video'],
        maxResults,
        order: 'date',
      })
      
      await QuotaManager.recordUsage('search.list')
      
      const videos = response.data.items?.map(item => ({
        videoId: item.id?.videoId!,
        title: item.snippet?.title!,
        publishedAt: item.snippet?.publishedAt!,
        thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
      })) || []
      
      await SystemLogger.debug('youtube', 'Channel videos retrieved', {
        userId: this.userId,
        count: videos.length,
      })
      
      return videos
    } catch (error) {
      await SystemLogger.error('youtube', 'Get channel videos failed', {
        userId: this.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }
  
  // Get channel information
  async getChannelInfo(): Promise<{
    channelId: string
    title: string
    thumbnail: string
    subscriberCount?: number
  }> {
    const quotaCheck = await QuotaManager.checkQuota('channels.list')
    if (!quotaCheck.allowed) {
      throw new Error(`Quota exceeded: ${quotaCheck.remainingQuota} units remaining`)
    }
    
    await this.ensureValidToken()
    
    try {
      const response = await this.youtube.channels.list({
        part: ['snippet', 'statistics'],
        mine: true,
      })
      
      await QuotaManager.recordUsage('channels.list')
      
      if (!response.data.items?.length) {
        throw new Error('No channel found')
      }
      
      const channel = response.data.items[0]
      
      return {
        channelId: channel.id!,
        title: channel.snippet?.title!,
        thumbnail: channel.snippet?.thumbnails?.medium?.url || channel.snippet?.thumbnails?.default?.url || '',
        subscriberCount: parseInt(channel.statistics?.subscriberCount || '0'),
      }
    } catch (error) {
      await SystemLogger.error('youtube', 'Get channel info failed', {
        userId: this.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }
}