import { notFound } from 'next/navigation'
import { getAssessmentById } from '@/lib/assessment'
import { isValidUUID } from '@/lib/validation'
import { Badge } from '@/components/ui/badge'

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

  return (
    <div className='max-w-3xl mx-auto py-8 space-y-6'>
      <h1 className='text-2xl font-bold'>Assessment Detail</h1>
      <h2 className='text-xl font-semibold'>{assessment.title}</h2>

      <p className='text-sm text-muted-foreground'>
        Created: {new Date(assessment.createdAt).toLocaleString()}
      </p>
      <div className='flex flex-wrap items-center gap-2 mt-2'>
        {assessment.tags.map((t) => (
          <Badge key={t.id} variant='secondary'>
            {t.name}
          </Badge>
        ))}
      </div>
      <div className='space-y-6 mt-6'>
        {questions.map((q, i) => (
          <div
            key={i}
            className='border p-4 rounded-lg shadow-sm bg-white dark:bg-gray-900'
          >
            <h2 className='font-semibold'>
              Q{i + 1}. {q.question}
            </h2>

            {Array.isArray(q.tags) && q.tags.length > 0 && (
              <div className='flex flex-wrap items-center gap-2 mt-2'>
                {q.tags.map((tagId) => {
                  const tag = assessment.tags.find((t) => t.id === tagId)
                  return tag ? (
                    <Badge key={tag.id} variant='outline'>
                      {tag.name}
                    </Badge>
                  ) : null
                })}
              </div>
            )}

            {q.type === 'multiple-choice-single' &&
              Array.isArray(q.choices) && (
                <>
                  <ul className='mt-2 list-none text-sm text-muted-foreground space-y-1'>
                    {q.choices.map((opt) => {
                      return (
                        <li key={opt.id}>
                          <span className='font-semibold'>
                            {opt.id.toUpperCase()}.{' '}
                          </span>
                          {opt.label}
                        </li>
                      )
                    })}
                  </ul>

                  <p className='mt-2 text-sm'>
                    ✅{' '}
                    <strong>
                      Answer:{' '}
                      {q.choices
                        .filter((opt) => q.answers.includes(opt.id))
                        .map((opt) => opt.id.toUpperCase())
                        .join(', ')}
                    </strong>
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
