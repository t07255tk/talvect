import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/requreAuth'
import getAvailableTags from '@/lib/tags'

export async function GET() {
  const user = await requireAuth()
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const tags = await getAvailableTags(user.id)
  return NextResponse.json(tags)
}
