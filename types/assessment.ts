import { AssessmentItem } from '@/lib/validation/assessmentSchema'
import { TagDto } from './tag'

export type {
  Assessment,
  AssessmentItem,
} from '@/lib/validation/assessmentSchema'

export type AssessmentDto = {
  id: string
  title: string
  description?: string
  questions: AssessmentItem[]
  createdAt: string
  tags: TagDto[]
}
