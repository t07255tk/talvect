import OpenAI from 'openai'
import { describe, it, expect, vi } from 'vitest'
import { generateAssessment } from './assessment'

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
describe('generateAssessment', () => {
  it('should return valid AssessmentItems when GPT responds correctly', async () => {
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify([
              {
                type: 'multiple-choice',
                question: 'What is 2+2?',
                choices: ['3', '4', '5', '6'],
                answer: '4',
                explanation: 'Basic math',
                tags: ['1', '2'],
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

    const result = await generateAssessment(testTags, mockOpenAI)
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

    const result = await generateAssessment(testTags, mockOpenAI)
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

    const result = await generateAssessment(testTags, mockOpenAI)
    expect(result).toEqual([])
  })
})
