import { User } from '@prisma/client'
import { User as NextAuthUser } from 'next-auth'
import prisma from '@/prisma/client'

export const createUserIfNotExists = async (user: NextAuthUser) => {
  // ユーザーが存在しない場合は作成
  const existingUser: User | null = await getUserByEmail(user.email!)
  if (!existingUser) {
    const newUser: User = await prisma.user.create({
      data: {
        email: user.email!,
        name: user.name!,
        image: user.image!,
      },
    })
    return newUser
  }
  return existingUser
}

export const getUserByEmail = async (email: string) => {
  const user: User | null = await prisma.user.findUnique({
    where: { email },
  })
  return user
}
