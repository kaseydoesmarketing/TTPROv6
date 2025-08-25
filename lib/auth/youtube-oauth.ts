// YouTube OAuth - completely separate from Firebase authentication
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import CryptoJS from 'crypto-js'

export class YouTubeAuth {
  private oauth2Client: OAuth2Client
  
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`
    )
  }
  
  // Generate OAuth URL for YouTube permissions
  generateAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ]
    
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // Force to get refresh token
      scope: scopes,
      state: userId, // Pass user ID for callback
    })
  }
  
  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code)
      
      if (!tokens.refresh_token) {
        throw new Error('No refresh token received. User must re-authorize.')
      }
      
      return {
        accessToken: this.encrypt(tokens.access_token!),
        refreshToken: this.encrypt(tokens.refresh_token),
        expiryDate: new Date(tokens.expiry_date!),
      }
    } catch (error) {
      console.error('Token exchange error:', error)
      throw error
    }
  }
  
  // Refresh access token using refresh token
  async refreshAccessToken(refreshToken: string) {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: this.decrypt(refreshToken),
      })
      
      const { credentials } = await this.oauth2Client.refreshAccessToken()
      
      if (!credentials.access_token) {
        throw new Error('Failed to refresh access token')
      }
      
      return {
        accessToken: this.encrypt(credentials.access_token),
        expiryDate: new Date(credentials.expiry_date!),
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      throw error
    }
  }
  
  // Encrypt tokens for storage
  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, process.env.ENCRYPTION_KEY!).toString()
  }
  
  // Decrypt tokens for use
  private decrypt(text: string): string {
    const bytes = CryptoJS.AES.decrypt(text, process.env.ENCRYPTION_KEY!)
    return bytes.toString(CryptoJS.enc.Utf8)
  }
}