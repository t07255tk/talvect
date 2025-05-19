import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.local' })
} else {
  dotenv.config()
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
