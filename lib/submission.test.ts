import { Prisma } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '@/prisma/client'
import { createSubmissionWithUserAnswers } from './submission'

const userId = 'user-123'
const assessmentId = 'assessment-123'
const answers = [
  {
    questionId: 'question-1',
    selectedChoices: [
      { choiceId: 'choice-1', orderIndex: 0 },
      { choiceId: 'choice-2', orderIndex: 1 },
    ],
  },
  {
    questionId: 'question-2',
    selectedChoices: [{ choiceId: 'choice-3', orderIndex: 0 }],
  },
]

let tx: Prisma.TransactionClient

describe('createSubmissionWithUserAnswers', () => {
  beforeEach(() => {
    tx = {
      submission: {
        create: vi.fn().mockResolvedValue({
          id: 'submission-123',
          userId,
          assessmentId,
          completedAt: new Date(),
        }),
      },
      userAnswer: {
        create: vi.fn().mockResolvedValue({
          id: 'user-answer-123',
          submissionId: 'submission-123',
          questionId: 'question-1',
        }),
      },
    } as unknown as Prisma.TransactionClient

    vi.spyOn(prisma, '$transaction').mockImplementation(async (cb) => {
      return await cb(tx)
    })
  })

  it('should create a submission and corresponding user answers', async () => {
    const result = await createSubmissionWithUserAnswers(
      userId,
      assessmentId,
      answers,
    )

    // submissionの戻り値確認
    expect(result).toEqual({
      id: 'submission-123',
      userId,
      assessmentId,
      completedAt: expect.any(Date),
    })

    // submission.createが1回呼ばれたこと
    expect(tx.submission.create).toHaveBeenCalledTimes(1)
    expect(tx.submission.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId,
          assessmentId,
        }),
      }),
    )

    // userAnswer.createがanswers.length回呼ばれたこと
    expect(tx.userAnswer.create).toHaveBeenCalledTimes(answers.length)

    // 各呼び出しの引数を確認
    answers.forEach((answer, index) => {
      expect(tx.userAnswer.create).toHaveBeenNthCalledWith(
        index + 1,
        expect.objectContaining({
          data: expect.objectContaining({
            submissionId: 'submission-123',
            questionId: answer.questionId,
            userAnswerChoices: expect.objectContaining({
              create: answer.selectedChoices.map((choice) =>
                expect.objectContaining({
                  choice: { connect: { id: choice.choiceId } },
                  orderIndex: choice.orderIndex,
                }),
              ),
            }),
          }),
        }),
      )
    })
  })

  it('should create submission without user answers if answers is empty', async () => {
    const emptyAnswers: typeof answers = []

    const result = await createSubmissionWithUserAnswers(
      userId,
      assessmentId,
      emptyAnswers,
    )

    expect(result).toEqual({
      id: 'submission-123',
      userId,
      assessmentId,
      completedAt: expect.any(Date),
    })

    expect(tx.submission.create).toHaveBeenCalledTimes(1)
    expect(tx.userAnswer.create).not.toHaveBeenCalled()
  })
})
