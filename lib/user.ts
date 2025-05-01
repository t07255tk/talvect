import prisma from '@/prisma/client'
import { User } from '@prisma/client'
import { User as NextAuthUser } from 'next-auth'

export const createUserIfNotExists = async (user: NextAuthUser) => {
  // ユーザーが存在しない場合は作成
  const existingUser: User | null = await prisma.user.findUnique({
    where: { email: user.email! },
  })
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
