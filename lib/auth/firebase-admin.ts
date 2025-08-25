// Firebase Admin SDK - server-side token verification
import { initializeApp, cert, getApps, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

let app: App

if (!getApps().length) {
  try {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
    })
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error)
    throw new Error('Firebase Admin initialization failed')
  }
} else {
  app = getApps()[0]
}

export async function verifyFirebaseToken(token: string) {
  try {
    const decodedToken = await getAuth(app).verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error('Token verification failed:', error)
    throw new Error('Invalid authentication token')
  }
}

export async function getUserByUid(uid: string) {
  try {
    const userRecord = await getAuth(app).getUser(uid)
    return userRecord
  } catch (error) {
    console.error('Get user error:', error)
    throw new Error('User not found')
  }
}