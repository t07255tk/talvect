import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/requreAuth'
import { createSubmissionWithUserAnswers } from '@/lib/submission'
import { isValidUUID } from '@/lib/validation'
import { AnswersSchema } from '@/lib/validation/assessmentSchema'

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await requireAuth()
  const { id } = await params
  if (!isValidUUID(id))
    return NextResponse.json({ error: 'Invalid ID' }, { status: 404 })

  const body = await req.json()
  const { answers } = body
  const parsed = AnswersSchema.safeParse(answers)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid answers format' },
      { status: 400 },
    )
  }

  const validAnswers = parsed.data
  const submission = await createSubmissionWithUserAnswers(
    user.id,
    id,
    validAnswers,
  )

  return NextResponse.json({
    submissionId: submission.id,
    completedAt: submission.completed_at,
  })
}
