// YouTube OAuth callback handler
import { NextRequest, NextResponse } from 'next/server'
import { YouTubeAuth } from '@/lib/auth/youtube-oauth'
import { YouTubeClient } from '@/lib/youtube/client'
import { prisma } from '@/lib/prisma'
import { SystemLogger } from '@/lib/logging'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const userId = searchParams.get('state')
  const error = searchParams.get('error')
  
  // Handle OAuth errors
  if (error) {
    await SystemLogger.error('auth', 'YouTube OAuth error', {
      error,
      userId,
    })
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app?error=youtube_oauth_error&details=${encodeURIComponent(error)}`
    )
  }
  
  // Validate required parameters
  if (!code || !userId) {
    await SystemLogger.error('auth', 'YouTube OAuth callback missing parameters', {
      hasCode: !!code,
      hasUserId: !!userId,
    })
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app?error=invalid_callback`
    )
  }
  
  try {
    // Exchange authorization code for tokens
    const youtubeAuth = new YouTubeAuth()
    const tokens = await youtubeAuth.exchangeCodeForTokens(code)
    
    // Get channel information to validate connection
    const youtubeClient = new YouTubeClient(userId, tokens.accessToken, tokens.refreshToken)
    const channelInfo = await youtubeClient.getChannelInfo()
    
    // Update user with YouTube credentials and channel info
    await prisma.user.update({
      where: { id: userId },
      data: {
        youtubeAccessToken: tokens.accessToken,
        youtubeRefreshToken: tokens.refreshToken,
        youtubeTokenExpiry: tokens.expiryDate,
        youtubeChannelId: channelInfo.channelId,
        youtubeChannelName: channelInfo.title,
        youtubeConnectionValid: true,
      },
    })
    
    await SystemLogger.info('auth', 'YouTube connection successful', {
      userId,
      channelId: channelInfo.channelId,
      channelTitle: channelInfo.title,
      subscriberCount: channelInfo.subscriberCount,
    })
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app?youtube=connected&channel=${encodeURIComponent(channelInfo.title)}`
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    await SystemLogger.error('auth', 'YouTube OAuth callback failed', {
      userId,
      error: errorMessage,
    })
    
    // Mark connection as invalid if user exists
    if (userId) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { youtubeConnectionValid: false },
        })
      } catch (dbError) {
        // User might not exist, ignore this error
      }
    }
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app?error=youtube_auth_failed&details=${encodeURIComponent(errorMessage)}`
    )
  }
}