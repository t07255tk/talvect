import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.local' })
} else {
  dotenv.config()
}
const prisma = new PrismaClient()
export default prisma
