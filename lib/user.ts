import { Prisma, Role, User } from '@prisma/client'
import { User as NextAuthUser } from 'next-auth'
import { prisma } from '@/prisma/client'
import { UserDto } from '@/types/user'
import * as userModule from './user'

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

export const assignUserToCompany = async (
  userId: string,
  companyId: string,
  role: Role,
  tx?: Prisma.TransactionClient,
) => {
  const transaction = tx || prisma
  return await transaction.userCompany.upsert({
    where: {
      user_id_company_id: {
        user_id: userId,
        company_id: companyId,
      },
    },
    update: { role: role },
    create: {
      user_id: userId,
      company_id: companyId,
      role,
    },
  })
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

    await userModule.assignUserToCompany(user.id, company.id, Role.admin, tx)

    return company
  })
}
