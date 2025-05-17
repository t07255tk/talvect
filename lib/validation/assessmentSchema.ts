import { z } from 'zod'

export const ChoiceSchema = z.object({
  id: z.string(), // 'a', 'b', ...
  label: z.string(),
  weight: z.number().optional(),
  tags: z.array(z.string()).optional(),
})

export const MultipleChoiceItemSchema = z.object({
  type: z.literal('multiple-choice-single'),
  question: z.string(),
  choices: z.array(ChoiceSchema).length(4),
  answers: z.array(z.string()).min(1), // ['b'] or ['a', 'c'] など
  explanation: z.string().optional(),
  tags: z.array(z.string()).min(1).max(3),
})

export const EssayItemSchema = z.object({
  type: z.literal('essay'),
  question: z.string(),
  answers: z.array(z.string()).min(1), // 模範解答（複数可）
  explanation: z.string().optional(),
  tags: z.array(z.string()).min(1).max(3),
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
