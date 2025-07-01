import { z } from 'zod'

export const TagWeightSchema = z.record(z.string(), z.number().min(0).max(1))

export const ChoiceSchema = z.object({
  choiceId: z.string(),
  label: z.string(),
  tagWeights: TagWeightSchema.optional(),
})

export const MultipleChoiceItemSchema = z.object({
  id: z.string().optional(), // Optional ID for questions, can be generated later
  type: z.literal('MULTIPLE_CHOICE_ORDERED'),
  question: z.string(),
  choices: z.array(ChoiceSchema).length(4),
})

export const EssayItemSchema = z.object({
  id: z.string().optional(), // Optional ID for questions, can be generated later
  type: z.literal('ESSAY'),
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

const SelectedChoiceSchema = z.object({
  choiceId: z.string(),
  orderIndex: z.number().int().min(0).max(3).optional(),
})
export const AnswerSchema = z.object({
  questionId: z.string().uuid(),
  selectedChoices: z.array(SelectedChoiceSchema).optional(),
})

export const AnswersSchema = z.array(AnswerSchema)

export type Answer = z.infer<typeof AnswerSchema>
export type Answers = z.infer<typeof AnswersSchema>
