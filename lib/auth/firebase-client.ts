// Firebase client authentication - bulletproof separation from YouTube OAuth
'use client'

import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'placeholder.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:placeholder',
}

// Initialize Firebase app
let app: any = null
let auth: any = null

// Check if we're in browser and have valid config
const isValidConfig = typeof window !== 'undefined' && 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'placeholder-key'

try {
  if (isValidConfig) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    console.log('Firebase client initialized successfully with project:', firebaseConfig.projectId)
  } else {
    console.warn('Firebase config not available or invalid - using mock')
    // Mock auth for SSR/build time
    auth = {
      currentUser: null,
      onAuthStateChanged: () => () => {},
      signOut: () => Promise.resolve(),
    }
  }
} catch (error) {
  console.error('Firebase client initialization failed:', error)
  // Mock auth for build time
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signOut: () => Promise.resolve(),
  }
}

export { auth }

// Google provider for Firebase Auth (NOT YouTube access)
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// Firebase authentication functions (separate from YouTube)
export async function signInWithGoogle(): Promise<User> {
  // Check if Firebase is properly initialized
  if (!app || !isValidConfig) {
    throw new Error('Firebase not configured. Please add Firebase environment variables to enable authentication.')
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider)
    console.log('Google sign-in successful for user:', result.user.email)
    return result.user
  } catch (error: any) {
    console.error('Firebase auth error:', error)
    
    // Provide user-friendly error messages
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. Please try again.')
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup blocked. Please allow popups and try again.')
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.')
    } else {
      throw new Error('Failed to sign in with Google. Please try again.')
    }
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

// Auth state observer
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

// Get ID token for API calls
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  
  try {
    return await user.getIdToken()
  } catch (error) {
    console.error('Get ID token error:', error)
    return null
  }
}