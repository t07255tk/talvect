import prisma from '@/prisma/client'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { User } from 'next-auth'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  async signIn({ user }: { user: User }) {
    // ユーザーが存在しない場合は作成
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })
    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: user.email!,
          name: user.name!,
          image: user.image!,
        },
      })
    }
    return true
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
