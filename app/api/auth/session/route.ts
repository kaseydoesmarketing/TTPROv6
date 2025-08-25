// Session management endpoint
import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/lib/auth/firebase-admin'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No auth token' }, { status: 401 })
    }
    
    const decodedToken = await verifyFirebaseToken(token)
    
    // Get or create user
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
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        pictureUrl: user.pictureUrl,
        youtubeConnected: user.youtubeConnectionValid,
        youtubeChannelName: user.youtubeChannelName,
        maxDailyCampaigns: user.maxDailyCampaigns,
        dailyTitleChanges: user.dailyTitleChanges,
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Session error',
    }, { status: 500 })
  }
}