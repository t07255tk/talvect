import { prisma } from '@/prisma/client'
import { TagDto } from '@/types/tag'

export default async function getAvailableTags(): Promise<TagDto[]> {
  return await prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: { name: 'asc' },
  })
}
