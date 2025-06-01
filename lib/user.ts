import { Role, User } from '@prisma/client'
import { User as NextAuthUser } from 'next-auth'
import { prisma } from '@/prisma/client'
import { UserDto } from '@/types/user'

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

export const createCompanyAndAssignUser = async (user: UserDto) => {
  return await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: `${user.name}'s Company`,
        users: {
          create: {
            user_id: user.id,
          },
        },
      },
    })

    await tx.userCompany.upsert({
      where: {
        user_id_company_id: {
          user_id: user.id,
          company_id: company.id,
        },
      },
      update: { role: Role.admin },
      create: {
        user_id: user.id,
        company_id: company.id,
        role: Role.admin,
      },
    })

    return company
  })
}
