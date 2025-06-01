import { prisma } from '@/prisma/client'

import { Company } from '@prisma/client'

export const getCompanyForUser = async (
  userId: string,
): Promise<Company | null> => {
  const company = await prisma.company.findFirst({
    where: {
      users: {
        some: {
          user_id: userId,
        },
      },
    },
  })

  return company
}
