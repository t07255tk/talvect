import { notFound } from 'next/navigation'
import { getAssessmentById } from '@/lib/assessment'
import { isValidUUID } from '@/lib/validation'

export default async function AssessmentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = await params
  if (!isValidUUID(id)) notFound()
  const assessment = await getAssessmentById(id)

  if (!assessment) notFound()

  const questions = Array.isArray(assessment.questions)
    ? assessment.questions
    : []
  //
  return (
    <div className='max-w-3xl mx-auto py-8 space-y-6'>
      <h1 className='text-2xl font-bold'>Assessment Detail</h1>
      <h2 className='text-xl font-semibold'>{assessment.title}</h2>

      <p className='text-sm text-muted-foreground'>
        Created: {new Date(assessment.createdAt).toLocaleString()}
      </p>
      <p className='text-sm'>
        Tags: {assessment.tags.map((t) => t.name).join(', ')}
      </p>
      <div className='space-y-6 mt-6'>
        {questions.map((q, i) => (
          <div
            key={i}
            className='border p-4 rounded-lg shadow-sm bg-white dark:bg-gray-900'
          >
            <h2 className='font-semibold'>
              Q{i + 1}. {q.question}
            </h2>

            {q.type === 'multiple-choice' && Array.isArray(q.choices) && (
              <>
                <ul className='mt-2 list-disc list-inside text-sm text-muted-foreground'>
                  {q.choices.map((opt, j) => (
                    <li key={j}>{opt}</li>
                  ))}
                </ul>
                <p className='mt-2 text-sm'>
                  ✅ <strong>Answer:</strong> {q.answer}
                </p>
              </>
            )}

            {q.type === 'essay' && (
              <p className='mt-2 text-sm italic text-muted-foreground'>
                📝 Essay response expected.
              </p>
            )}

            {q.explanation && (
              <p className='text-xs text-muted-foreground mt-2'>
                💡 {q.explanation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
