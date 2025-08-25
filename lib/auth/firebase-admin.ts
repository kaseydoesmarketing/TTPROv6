// Firebase Admin SDK - server-side token verification
import { initializeApp, cert, getApps, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

let app: App | null = null

function getFirebaseAdmin(): App {
  if (!app) {
    if (!getApps().length) {
      try {
        // Check if we have the required environment variables
        if (!process.env.FIREBASE_PROJECT_ID || 
            !process.env.FIREBASE_CLIENT_EMAIL || 
            !process.env.FIREBASE_PRIVATE_KEY) {
          console.warn('Firebase Admin environment variables not configured')
          // Return a placeholder app for build time
          if (process.env.NODE_ENV === 'production') {
            throw new Error('Firebase Admin credentials not configured')
          }
        }
        
        app = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID || 'placeholder',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'placeholder@example.com',
            privateKey: (process.env.FIREBASE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nplaceholder\n-----END PRIVATE KEY-----').replace(/\\n/g, '\n'),
          }),
        })
      } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error)
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Firebase Admin initialization failed')
        }
      }
    } else {
      app = getApps()[0]
    }
  }
  
  return app!
}

export async function verifyFirebaseToken(token: string) {
  try {
    const adminApp = getFirebaseAdmin()
    const decodedToken = await getAuth(adminApp).verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error('Token verification failed:', error)
    throw new Error('Invalid authentication token')
  }
}

export async function getUserByUid(uid: string) {
  try {
    const adminApp = getFirebaseAdmin()
    const userRecord = await getAuth(adminApp).getUser(uid)
    return userRecord
  } catch (error) {
    console.error('Get user error:', error)
    throw new Error('User not found')
  }
}