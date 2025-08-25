// Quota status endpoint
import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/lib/auth/firebase-admin'
import { QuotaManager } from '@/lib/youtube/quota-manager'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No auth token' }, { status: 401 })
    }
    
    await verifyFirebaseToken(token)
    
    const quotaStatus = await QuotaManager.getQuotaStatus()
    
    return NextResponse.json({
      quota: quotaStatus
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Quota fetch error',
    }, { status: 500 })
  }
}