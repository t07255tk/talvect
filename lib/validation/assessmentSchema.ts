import { z } from 'zod'
export const TagWeightSchema = z.record(z.string(), z.number().min(0).max(1))

export const ChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  tagWeights: TagWeightSchema.optional(),
})

export const MultipleChoiceItemSchema = z.object({
  id: z.string().optional(), // Optional ID for questions, can be generated later
  type: z.literal('multiple-choice-single'),
  question: z.string(),
  choices: z.array(ChoiceSchema).length(4),
})

export const EssayItemSchema = z.object({
  id: z.string().optional(), // Optional ID for questions, can be generated later
  type: z.literal('essay'),
  question: z.string(),
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

export type Choice = z.infer<typeof ChoiceSchema>
export type AssessmentItem = z.infer<typeof AssessmentItemSchema>
export type Assessment = z.infer<typeof AssessmentSchema>
