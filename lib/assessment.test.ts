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
            type: 'multiple-choice-single',
            question: 'What is 2+2?',
            choices: [
              { id: 'A', label: '3' },
              { id: 'B', label: '4' },
              { id: 'C', label: '5' },
              { id: 'D', label: '6' },
            ],
            tagWeights: [{ '1': 0.6 }, { '2': 0.4 }],
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
                      type: 'multiple-choice-single',
                      question: 'What is 2+2?',
                      choices: [
                        { id: 'a', label: '3' },
                        { id: 'b', label: '4' },
                        { id: 'c', label: '5' },
                        { id: 'd', label: '6' },
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

    vi.spyOn(assessmentModule, 'generateQuestions').mockImplementation(
      async (tags, openaiInstance) => {
        console.log('✅ mock called with:', tags, openaiInstance)
        expect(tags).toEqual(testTags)
        expect(openaiInstance).toBe(mockOpenAI)
        return [
          {
            type: 'multiple-choice-single',
            question: 'What is 2+2?',
            choices: [
              { id: 'a', label: '3' },
              { id: 'b', label: '4' },
              { id: 'c', label: '5' },
              { id: 'd', label: '6' },
            ],
            answers: ['4'],
            explanation: 'Basic math',
            tags: ['1'],
          },
        ]
      },
    )
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

    const result = await assessmentModule.generateAssessment(
      testTags,
      'user-abc',
      mockOpenAI,
    )
    expect(result).toBe('test-assessment-id')
  })
})
