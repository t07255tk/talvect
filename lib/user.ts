import { Prisma, Role } from '@prisma/client'
import { User as NextAuthUser } from 'next-auth'
import { prisma } from '@/prisma/client'
import { UserDto } from '@/types/user'
import * as userModule from './user'

export const createUserIfNotExists = async (user: NextAuthUser) => {
  let existingUser = await userModule.getUserByEmail(user.email!)
  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: user.email!,
        name: user.name!,
        image: user.image!,
      },
    })
    existingUser = await userModule.getUserByEmail(user.email!) // ← もう一度取得
  }
  if (!existingUser) throw new Error('User creation failed')
  return existingUser
}

export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      companies: true,
    },
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
