// Prisma client singleton for TitleTesterPro v6
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prismaInstance: PrismaClient | null = null

function createPrismaClient(): PrismaClient {
  // Check if we're in build phase (no runtime available)
  if (typeof window === 'undefined' && !process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not configured - using mock client for build')
    // Return mock Prisma client for build time
    return {} as PrismaClient
  }
  
  if (!process.env.DATABASE_URL) {
    throw new Error('Database configuration missing')
  }
  
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? 
  (prismaInstance || (prismaInstance = createPrismaClient()))

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma