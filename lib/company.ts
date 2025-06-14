import { Company } from '@prisma/client'
import { prisma } from '@/prisma/client'

export const getCompanyForUser = async (
  userId: string,
): Promise<Company | null> => {
  const company = await prisma.company.findFirst({
    where: {
      users: {
        some: {
          userId,
        },
      },
    },
  })

  return company
}
