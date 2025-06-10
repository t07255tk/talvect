import { vi, describe, it, expect, beforeEach } from 'vitest'
import { POST } from '@/app/api/assessments/[id]/submit/route'

// 👇 static import は絶対NG（モックが無効になる）
// import { isValidUUID } from '@/lib/validation' ← 削除

vi.mock('@/lib/requreAuth', () => ({
  requireAuth: vi.fn(() => Promise.resolve({ id: 'mock-user-id' })),
}))

vi.mock('@/lib/submission', () => ({
  createSubmissionWithUserAnswers: vi.fn(() => {
    return Promise.resolve({
      id: 'submission-123',
      completed_at: new Date('2025-06-10T00:00:00Z'),
      user_id: 'mock-user-id',
      assessment_id: 'valid-uuid',
      started_at: new Date('2025-06-01T00:00:00Z'),
      created_at: new Date('2025-06-01T00:00:00Z'),
    })
  }),
}))

vi.mock('@/lib/validation', () => ({
  isValidUUID: vi.fn(),
}))

vi.mock('@/lib/validation/assessmentSchema', async () => {
  const { z } = await import('zod')
  return {
    AnswersSchema: z.array(
      z.object({ questionId: z.string(), choiceId: z.string() }),
    ),
  }
})

vi.mock('next/navigation', () => ({}))

describe('POST /api/assessment/[id]/submit', () => {
  const validAnswers = [{ questionId: 'q1', choiceId: 'c1' }]
  const mockUser = {
    id: 'user123',
    name: 'Test User',
    email: '',
    image: 'https://example.com/icon.png',
    companyId: 'company456',
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return 404 if UUID is invalid', async () => {
    const { isValidUUID } = await import('@/lib/validation')
    vi.mocked(isValidUUID).mockReturnValue(false)

    const response = await POST(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ answers: validAnswers }),
        headers: { 'Content-Type': 'application/json' },
      }),
      { params: { id: 'invalid-uuid' } },
    )

    expect(response.status).toBe(404)
  })

  it('should return 400 if answers format is invalid', async () => {
    const { isValidUUID } = await import('@/lib/validation')
    const { requireAuth } = await import('@/lib/requreAuth')

    vi.mocked(isValidUUID).mockReturnValue(true)
    vi.mocked(requireAuth).mockResolvedValue(mockUser)

    const response = await POST(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ answers: 'bad-data' }),
        headers: { 'Content-Type': 'application/json' },
      }),
      { params: { id: 'valid-uuid' } },
    )

    expect(response.status).toBe(400)
  })

  it('should call createSubmissionWithUserAnswers and return 200', async () => {
    const { isValidUUID } = await import('@/lib/validation')
    const { requireAuth } = await import('@/lib/requreAuth')
    const { createSubmissionWithUserAnswers } = await import('@/lib/submission')

    vi.mocked(isValidUUID).mockReturnValue(true)
    vi.mocked(requireAuth).mockResolvedValue(mockUser)
    vi.mocked(createSubmissionWithUserAnswers).mockResolvedValue({
      id: 'submission-123',
      completed_at: new Date('2025-06-10T00:00:00Z'),
      user_id: '',
      assessment_id: '',
      started_at: new Date('2025-06-01T00:00:00Z'),
      created_at: new Date('2025-06-01T00:00:00Z'),
    })

    const response = await POST(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ answers: validAnswers }),
        headers: { 'Content-Type': 'application/json' },
      }),
      { params: { id: 'valid-uuid' } },
    )

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({
      submissionId: 'submission-123',
      completedAt: '2025-06-10T00:00:00.000Z',
    })
  })
})
