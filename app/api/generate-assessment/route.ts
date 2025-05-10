import { NextRequest, NextResponse } from 'next/server'
import { generateAssessment } from '@/lib/assessment'
import { requireAuth } from '@/lib/requreAuth'
import getAvailableTags from '@/lib/tags'

export async function POST(req: NextRequest) {
  const { id: userId } = await requireAuth()
  const { tags } = await req.json()

  if (!Array.isArray(tags) || tags.some((id) => typeof id !== 'string')) {
    return NextResponse.json({ error: 'Invalid tag IDs' }, { status: 400 })
  }

  const allTags = await getAvailableTags(userId)
  const selectedTags = allTags.filter((tag) => tags.includes(tag.id))

  if (selectedTags.length === 0) {
    return NextResponse.json(
      { error: 'No valid tags selected' },
      { status: 404 },
    )
  }

  const assessment = await generateAssessment(selectedTags)

  return NextResponse.json({ assessment })
}
