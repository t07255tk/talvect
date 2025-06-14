import { Prisma } from '@prisma/client'
import OpenAI from 'openai'
import { describe, it, expect, vi } from 'vitest'
import { prisma } from '@/prisma/client'
import * as assessmentModule from './assessment'

const testTags = [
  {
    id: '1',
    name: 'JavaScript',
    description: 'A programming language for web development',
  },
  {
    id: '2',
    name: 'Python',
    description: 'A programming language for data science',
  },
  {
    id: '3',
    name: 'Java',
    description: 'A programming language for enterprise applications',
  },
]

const mockCreate = vi.fn().mockResolvedValue({
  choices: [
    {
      message: {
        content: JSON.stringify([
          {
            type: 'MULTIPLE_CHOICE_SINGLE',
            question: 'What is 2+2?',
            choices: [
              {
                id: 'a',
                choiceId: 'A',
                label: '3',
                tagWeights: { '1': 0.6, '2': 0.4 },
              },
              {
                id: 'b',
                choiceId: 'B',
                label: '4',
              },
              {
                id: 'c',
                choiceId: 'C',
                label: '5',
              },
              {
                id: 'd',
                choiceId: 'D',
                label: '6',
              },
            ],
          },
        ]),
      },
    },
  ],
})

const mockOpenAI = {
  chat: {
    completions: {
      create: mockCreate,
    },
  },
} as unknown as OpenAI
describe('generateQuestions', () => {
  it('should return valid AssessmentItems when GPT responds correctly', async () => {
    const result = await assessmentModule.generateQuestions(
      testTags,
      mockOpenAI,
    )
    expect(result).toHaveLength(1)
    expect(result[0].question).toBe('What is 2+2?')
  })

  it('should return [] when GPT returns invalid JSON', async () => {
    const mockOpenAI = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: '{bad json}',
                },
              },
            ],
          }),
        },
      },
    } as unknown as OpenAI

    const result = await assessmentModule.generateQuestions(
      testTags,
      mockOpenAI,
    )
    expect(result).toEqual([])
  })

  it('should return [] when GPT returns empty content', async () => {
    const mockOpenAI = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: '',
                },
              },
            ],
          }),
        },
      },
    } as unknown as OpenAI

    const result = await assessmentModule.generateQuestions(
      testTags,
      mockOpenAI,
    )
    expect(result).toEqual([])
  })
})

describe('generateAssessment', () => {
  it('should call generateQuestions with correct parameters', async () => {
    const mockOpenAI = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify([
                    {
                      type: 'MULTIPLE_CHOICE_SINGLE',
                      question: 'What is 2+2?',
                      choices: [
                        {
                          id: 'a',
                          label: '3',
                          tagWeights: [
                            {
                              id: '1',
                              choiceId: 'A',
                              tagId: 'a',
                              weight: 0.6,
                            },
                            {
                              id: '2',
                              choiceId: 'B',
                              tagId: 'b',
                              weight: 0.8,
                            },
                          ],
                        },
                        { id: 'b', tagId: 'b', label: '4' },
                        { id: 'c', tagId: 'c', label: '5' },
                        { id: 'd', tagId: 'd', label: '6' },
                      ],
                      answers: ['4'],
                      explanation: 'Simple math',
                      tags: ['1'],
                    },
                  ]),
                },
              },
            ],
          }),
        },
      },
    } as unknown as OpenAI

    const mockGenerateQuestions = vi.fn().mockResolvedValue([
      {
        type: 'MULTIPLE_CHOICE_SINGLE',
        question: 'What is 2+2?',
        choices: [
          {
            id: 'a',
            choiceId: 'A',
            label: '3',
            tagWeights: { '1': 0.6, '2': 0.4 },
          },
          { id: 'b', choiceId: 'B', label: '4' },
          { id: 'c', choiceId: 'C', label: '5' },
          { id: 'd', choiceId: 'D', label: '6' },
        ],
      },
    ])
    const mockTx = {
      assessment: {
        create: vi.fn().mockResolvedValue({ id: 'test-assessment-id' }),
      },
      assessmentTag: {
        createMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
    } as unknown as Prisma.TransactionClient
    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback) => {
      return await callback(mockTx as unknown as Prisma.TransactionClient)
    })

    const userDto = {
      id: 'user-abc',
      companyId: 'company-xyz',
      name: null,
      image: null,
      email: 'test@example.com',
    }
    const result = await assessmentModule.generateAssessment(
      testTags,
      userDto,
      mockOpenAI,
      mockGenerateQuestions,
    )
    expect(result).toBe('test-assessment-id')
  })
})
