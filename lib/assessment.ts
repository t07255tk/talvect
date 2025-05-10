import OpenAI from 'openai'
import {
  AssessmentItem,
  AssessmentItemArraySchema,
} from '@/lib/validation/assessmentSchema'
import { TagDto } from '@/types/tag'
import { generateAssessmentPrompt } from './assessmentPrompt'

export async function generateAssessment(
  tags: TagDto[],
  openaiInstance?: OpenAI,
): Promise<AssessmentItem[]> {
  const openai =
    openaiInstance ||
    new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })

  const prompt = generateAssessmentPrompt(tags)

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
