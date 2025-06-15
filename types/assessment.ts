import { TagDto } from './tag'

export type {
  Assessment,
  AssessmentItem,
} from '@/lib/validation/assessmentSchema'

export type AssessmentDto = {
  id: string
  title: string
  description?: string
  questions: AssessmentQuestionDto[]
  createdAt: string
  tags: TagDto[]
}

type AssessmentQuestionDto = MultipleChoiceQuestionDto | EssayQuestionDto
type MultipleChoiceQuestionDto = {
  id?: string
  type: 'MULTIPLE_CHOICE_SINGLE'
  question: string
  choices: AssessmentChoiceDto[]
}

type EssayQuestionDto = {
  id?: string
  type: 'ESSAY'
  question: string
}

type AssessmentChoiceDto = {
  id: string
  choiceId: string
  label: string
  tagWeights?: AssessmentTagWeightDto[]
}

type AssessmentTagWeightDto = {
  tagId: string
  weight: number
  name: string
}
type Question = {
  id: string
  type: string
  question: string
  choices: Array<{
    id: string
    choiceId: string
    label: string
    tagWeights: Array<{
      weight: number
      tag: {
        id: string
        name: string
      }
    }>
  }>
}
export const toAssessmentQuestionDto = (
  question: Question,
): AssessmentQuestionDto => {
  if (question.type === 'MULTIPLE_CHOICE_SINGLE') {
    return {
      id: question.id,
      type: question.type,
      question: question.question,
      choices: question.choices.map((choice) => ({
        id: choice.id,
        choiceId: choice.choiceId,
        label: choice.label,
        tagWeights: choice.tagWeights.map((tw) => ({
          tagId: tw.tag.id,
          weight: tw.weight,
          name: tw.tag.name, // Assuming you want to include the tag name as well
        })),
      })),
    }
  } else if (question.type === 'ESSAY') {
    return {
      id: question.id,
      type: question.type,
      question: question.question,
    }
  } else {
    throw new Error(`Unknown question type: ${question.type}`)
  }
}
