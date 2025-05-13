import OpenAI from 'openai'
import {
  AssessmentItem,
  AssessmentItemArraySchema,
} from '@/lib/validation/assessmentSchema'
import prisma from '@/prisma/client'
import { AssessmentDto } from '@/types/assessment'
import { TagDto } from '@/types/tag'
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
      messages: [
        {
          role: 'system',
          content:
            'You are a strict exam generator. Always create difficult, logic-based multiple-choice questions with plausible distractors and only one correct answer.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    })

    const jsonText = res.choices[0].message.content?.trim()

    if (!jsonText) {
      console.error('GPT returned empty content')
      return []
    }

    const parsed = JSON.parse(jsonText)
    const result = AssessmentItemArraySchema.safeParse(parsed)
    if (!result.success) {
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
  createdBy: string,
  openaiInstance?: OpenAI,
): Promise<string | null> {
  try {
    const questions = await generateQuestions(tags, openaiInstance)

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
          questions,
          created_by: createdBy,
        },
      })

      await tx.assessmentTag.createMany({
        data: tags.map((tag) => ({
          assessment_id: newAssessment.id,
          tag_id: tag.id,
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

export async function getAssessments(userId: string): Promise<AssessmentDto[]> {
  const assessments = await prisma.assessment.findMany({
    where: { created_by: userId },
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      questions: true,
    },
  })

  return assessments.map((assessment) => ({
    id: assessment.id,
    title: assessment.title,
    description: assessment.description || undefined,
    questions: assessment.questions as AssessmentItem[],
  }))
}
