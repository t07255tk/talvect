import { Submission, User } from '@prisma/client'
import { prisma } from '@/prisma/client'
import { Answers } from './validation/assessmentSchema'

export async function createSubmissionWithUserAnswers(
  userId: string,
  assessmentId: string,
  answers: Answers,
) {
  return await prisma.$transaction(async (tx) => {
    const submission = await tx.submission.create({
      data: {
        userId,
        assessmentId,
        completedAt: new Date(),
      },
    })

    const userAnswerCreates = answers.map((answer) =>
      tx.userAnswer.create({
        data: {
          submissionId: submission.id,
          questionId: answer.questionId,
          userAnswerChoices: {
            create: answer.selectedChoices?.map((choice) => ({
              choice: { connect: { id: choice.choiceId } },
              orderIndex: choice.orderIndex ?? 0,
            })),
          },
        },
      }),
    )

    await Promise.all(userAnswerCreates)

    return submission
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
          userAnswerChoices: {
            include: {
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
      for (const tw of ua.userAnswerChoices
        ?.map((c) => c.choice.tagWeights)
        .flat() || []) {
        const tagName = tw.tag.id
        const weight = tw.weight
        if (!tagScores[tagName]) tagScores[tagName] = []
        tagScores[tagName].push(weight)
      }
    }

    const tagSummary: Record<string, number> = {}
    for (const [tagName, values] of Object.entries(tagScores)) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      tagSummary[tagName] = Math.round(avg * 100) / 100 // 小数第2位まで
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
          userAnswerChoices: {
            include: {
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
      },
    },
  })

  if (!submission) return null

  // tagSummary生成
  const tagScores: Record<string, number[]> = {}
  for (const ua of submission.userAnswers) {
    for (const tw of ua.userAnswerChoices
      ?.map((c) => c.choice.tagWeights)
      .flat() || []) {
      const tagName = tw.tag.name
      if (!tagScores[tagName]) tagScores[tagName] = []
      tagScores[tagName].push(tw.weight)
    }
  }

  const tagSummary: Record<string, number> = {}
  for (const [tagName, values] of Object.entries(tagScores)) {
    tagSummary[tagName] =
      Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) /
      100
  }

  return { ...submission, tagSummary }
}
