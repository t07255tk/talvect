import OpenAI from 'openai'
import {
  AssessmentItem,
  AssessmentItemArraySchema,
} from '@/lib/validation/assessmentSchema'
import { prisma } from '@/prisma/client'
import { AssessmentDto, toAssessmentQuestionDto } from '@/types/assessment'
import { TagDto } from '@/types/tag'
import { UserDto } from '@/types/user'
import { generateQuestionsPrompt } from './assessmentPrompt'

export async function generateQuestions(
  tags: TagDto[],
  openaiInstance?: OpenAI,
): Promise<AssessmentItem[]> {
  const openai =
    openaiInstance ||
    new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })

  const prompt = generateQuestionsPrompt(tags)

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.9,
      max_tokens: 2048,
      messages: [
        {
          role: 'system',
          content:
            'You are a strict and self-correcting exam generator. You create nuanced, realistic MULTIPLE_CHOICE_SINGLE questions that challenge judgment, not recall. You always internally review your own output to eliminate idealized answers or weak distractors before returning the final result.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const jsonText = res.choices[0].message.content?.trim()
    const cleaned = jsonText
      ?.replace(/^```json/, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim()

    if (!cleaned) {
      console.error('Empty or malformed JSON from OpenAI')
      return []
    }

    const parsed = JSON.parse(cleaned)
    const result = AssessmentItemArraySchema.safeParse(parsed)
    if (!result.success) {
      console.dir(result.error.errors, { depth: null, colors: true })
      console.error('Validation failed:', result.error.format())
      return []
    }
    return result.data
  } catch (e) {
    console.error('Failed to generate assessment:', e)
    return []
  }
}

export async function generateAssessment(
  tags: TagDto[],
  createdUser: UserDto,
  openaiInstance?: OpenAI,
  generateQuestionsFn: typeof generateQuestions = generateQuestions,
): Promise<string | null> {
  try {
    const questions = await generateQuestionsFn(tags, openaiInstance)

    if (!questions || questions.length === 0) {
      return null
    }

    const title = `Assessment for: ${tags.map((t) => t.name).join(', ')}`
    const description = `This test evaluates: ${tags
      .map((t) => t.name)
      .join(', ')}`

    const newAssessmentId = await prisma.$transaction(async (tx) => {
      const newAssessment = await tx.assessment.create({
        data: {
          title,
          description,
          createdBy: createdUser.id,
          companyId: createdUser.companyId!,
          questions: {
            create: questions.map((q) => {
              if (q.type === 'MULTIPLE_CHOICE_SINGLE') {
                return {
                  type: q.type,
                  question: q.question,
                  choices: {
                    create: q.choices.map((c) => ({
                      choiceId: c.choiceId,
                      label: c.label,
                      tagWeights: {
                        create: (c.tagWeights
                          ? Object.entries(c.tagWeights)
                          : Object.entries({})
                        ).map(([tagId, weight]) => ({
                          tag: {
                            connect: { id: tagId },
                          },
                          weight: Number(weight),
                        })),
                      },
                    })),
                  },
                }
              } else {
                return {
                  type: q.type,
                  question: q.question,
                }
              }
            }),
          },
        },
      })

      await tx.assessmentTag.createMany({
        data: tags.map((tag) => ({
          assessmentId: newAssessment.id,
          tagId: tag.id,
        })),
        skipDuplicates: true,
      })

      return newAssessment.id
    })

    return newAssessmentId
  } catch (e) {
    console.error('Failed to generate and save assessment:', e)
    return null
  }
}

export async function getAssessments(
  userId: string,
): Promise<Omit<AssessmentDto, 'questions'>[]> {
  const assessments = await prisma.assessment.findMany({
    where: { createdBy: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  return assessments.map((assessment) => ({
    id: assessment.id,
    title: assessment.title,
    description: assessment.description || undefined,
    createdAt: assessment.createdAt.toISOString(),
    tags: assessment.tags.map((at) => ({
      id: at.tag.id,
      name: at.tag.name,
      description: at.tag.description,
    })),
  }))
}

export async function getAssessmentById(
  id: string,
): Promise<AssessmentDto | null> {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      questions: {
        include: {
          choices: {
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
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  if (!assessment) return null

  const questions = assessment.questions.map((q) => {
    return toAssessmentQuestionDto(q)
  })
  return {
    id: assessment.id,
    title: assessment.title,
    description: assessment.description || undefined,
    questions: questions,
    createdAt: assessment.createdAt.toISOString(),
    tags: assessment.tags.map((at) => ({
      id: at.tag.id,
      name: at.tag.name,
      description: at.tag.description,
    })),
  }
}
