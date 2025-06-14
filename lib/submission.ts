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
      userId,
      assessmentId,
      completedAt: new Date(),
      userAnswers: {
        createMany: {
          data: answers.map((a) => ({
            questionId: a.questionId,
            choiceId: a.choiceId,
            confidence: a.confidence,
            comment: a.comment,
            answeredAt: new Date(),
          })),
        },
      },
    },
  })
}
