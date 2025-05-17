import { z } from 'zod'

export const MultipleChoiceItemSchema = z.object({
  type: z.literal('multiple-choice'),
  question: z.string(),
  choices: z.array(z.string()).length(4),
  answer: z.string(),
  explanation: z.string().optional(),
  tags: z.array(z.string()).min(1).max(3),
})

export const EssayItemSchema = z.object({
  type: z.literal('essay'),
  question: z.string(),
  answer: z.string(),
  explanation: z.string().optional(),
})

export const AssessmentItemSchema = z.union([
  MultipleChoiceItemSchema,
  EssayItemSchema,
])

export const AssessmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(AssessmentItemSchema),
})

export const AssessmentArraySchema = z.array(AssessmentSchema)
export const AssessmentItemArraySchema = z.array(AssessmentItemSchema)

export type AssessmentItem = z.infer<typeof AssessmentItemSchema>
export type Assessment = z.infer<typeof AssessmentSchema>
