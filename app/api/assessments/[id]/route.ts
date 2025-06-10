import { NextResponse } from 'next/server'
import { getAssessmentById } from '@/lib/assessment'

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = await params
  const assessment = await getAssessmentById(id)
  if (!assessment) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
  }
  return NextResponse.json({
    assessment,
    serverTime: new Date().toISOString(),
  })
}
