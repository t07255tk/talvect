import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { User } from 'next-auth'
import { createUserIfNotExists } from '@/lib/user'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }: { user: User }) {
      await createUserIfNotExists(user)
      return true
    },

    async redirect({ baseUrl }: { baseUrl: string }) {
      return `${baseUrl}/dashboard`
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
