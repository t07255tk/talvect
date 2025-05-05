import { NextRequest, NextResponse } from 'next/server'
import { generateAssessment } from '@/lib/generateAssessment'
import { requireAuth } from '@/lib/requreAuth'

export async function POST(req: NextRequest) {
  await requireAuth()

  const { text } = await req.json()
  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const quiz = await generateAssessment(text)

  return NextResponse.json({ quiz })
}
