// YouTube OAuth connection initiation
import { NextRequest, NextResponse } from 'next/server'
import { YouTubeAuth } from '@/lib/auth/youtube-oauth'
import { verifyFirebaseToken } from '@/lib/auth/firebase-admin'
import { prisma } from '@/lib/prisma'
import { SystemLogger } from '@/lib/logging'

export async function GET(request: NextRequest) {
  try {
    // Verify Firebase auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No auth token provided' }, { status: 401 })
    }
    
    const decodedToken = await verifyFirebaseToken(token)
    
    // Get or create user record
    const user = await prisma.user.upsert({
      where: { firebaseUid: decodedToken.uid },
      update: {
        email: decodedToken.email!,
        name: decodedToken.name,
        pictureUrl: decodedToken.picture,
      },
      create: {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email!,
        name: decodedToken.name,
        pictureUrl: decodedToken.picture,
      },
    })
    
    // Generate YouTube OAuth URL
    const youtubeAuth = new YouTubeAuth()
    const authUrl = youtubeAuth.generateAuthUrl(user.id)
    
    await SystemLogger.info('auth', 'YouTube OAuth URL generated', {
      userId: user.id,
      email: user.email,
    })
    
    return NextResponse.json({ 
      authUrl,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        youtubeConnected: user.youtubeConnectionValid,
      }
    })
  } catch (error) {
    await SystemLogger.error('auth', 'YouTube OAuth connection failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to generate auth URL',
    }, { status: 500 })
  }
}