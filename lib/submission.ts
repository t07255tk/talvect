import { prisma } from '@/prisma/client'

export async function createSubmissionWithUserAnswers(
  userId: string,
  assessmentId: string,
  answers: {
    questionId: string
    choiceId: string
    confidence?: number
    comment?: string
  }[],
) {
  return await prisma.submission.create({
    data: {
      user_id: userId,
      assessment_id: assessmentId,
      completed_at: new Date(),
      user_answers: {
        createMany: {
          data: answers.map((a) => ({
            question_id: a.questionId,
            choice_id: a.choiceId,
            confidence: a.confidence,
            comment: a.comment,
            answered_at: new Date(),
          })),
        },
      },
    },
  })
}
