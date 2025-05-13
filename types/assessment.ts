import { AssessmentItem } from '@/lib/validation/assessmentSchema'

export type {
  Assessment,
  AssessmentItem,
} from '@/lib/validation/assessmentSchema'

export type AssessmentDto = {
  id: string
  title: string
  description?: string
  questions: AssessmentItem[]
}
