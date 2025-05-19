import { prisma } from '@/prisma/client'
import { TagDto } from '@/types/tag'

export default async function getAvailableTags(
  userId: string,
): Promise<TagDto[]> {
  return await prisma.tag.findMany({
    where: {
      OR: [{ created_by: null }, { created_by: userId }],
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: { name: 'asc' },
  })
}
