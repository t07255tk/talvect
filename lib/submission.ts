import { Submission, User } from '@prisma/client'
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

export async function getSubmissions(
  assessmentId: string,
): Promise<
  (Submission & { user: User; tagSummary: Record<string, number> })[]
> {
  const submissions = await prisma.submission.findMany({
    where: { assessmentId },
    include: {
      user: true,
      assessment: true,
      userAnswers: {
        include: {
          question: {
            include: {
              choices: {
                include: {
                  tagWeights: {
                    include: { tag: true },
                  },
                },
              },
            },
          },
          choice: {
            include: {
              tagWeights: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      completedAt: 'desc',
    },
  })

  // 各 submission に tagSummary を追加
  return submissions.map((s) => {
    const tagScores: Record<string, number[]> = {}

    for (const ua of s.userAnswers) {
      for (const tw of ua.choice?.tagWeights || []) {
        const tagId = tw.tag.id
        const weight = tw.weight
        if (!tagScores[tagId]) tagScores[tagId] = []
        tagScores[tagId].push(weight)
      }
    }

    const tagSummary: Record<string, number> = {}
    for (const [tagId, values] of Object.entries(tagScores)) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      tagSummary[tagId] = Math.round(avg * 100) / 100 // 小数第2位まで
    }

    return { ...s, tagSummary }
  })
}

export async function getSubmissionById(submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      user: true,
      assessment: true,
      userAnswers: {
        include: {
          question: {
            include: {
              choices: {
                include: {
                  tagWeights: {
                    include: { tag: true },
                  },
                },
              },
            },
          },
          choice: {
            include: {
              tagWeights: {
                include: { tag: true },
              },
            },
          },
        },
      },
    },
  })

  if (!submission) return null

  // tagSummary生成
  const tagScores: Record<string, number[]> = {}
  for (const ua of submission.userAnswers) {
    for (const tw of ua.choice?.tagWeights ?? []) {
      const tagId = tw.tag.id
      if (!tagScores[tagId]) tagScores[tagId] = []
      tagScores[tagId].push(tw.weight)
    }
  }

  const tagSummary: Record<string, number> = {}
  for (const [tagId, values] of Object.entries(tagScores)) {
    tagSummary[tagId] =
      Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) /
      100
  }

  return { ...submission, tagSummary }
}
