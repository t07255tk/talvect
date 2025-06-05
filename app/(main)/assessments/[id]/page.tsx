import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { getAssessmentById } from '@/lib/assessment'
import { isValidUUID } from '@/lib/validation'

function getBadgeClass(weight: number) {
  if (weight >= 0.75) return 'bg-red-500 text-white'
  if (weight >= 0.5) return 'bg-orange-400 text-black'
  if (weight >= 0.25) return 'bg-yellow-300 text-black'
  if (weight > 0) return 'bg-gray-300 text-gray-800'
  return 'bg-muted text-muted-foreground'
}

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

      <div className='flex flex-wrap items-center gap-2 mt-1'>
        {assessment.tags.map((t) => (
          <Badge key={t.id} variant='secondary'>
            {t.name}
          </Badge>
        ))}
      </div>

      <p className='text-sm text-muted-foreground mt-2'>
        {assessment.description?.trim() || 'No description'}
      </p>

      <p className='text-xs text-muted-foreground'>
        Created: {new Date(assessment.createdAt).toLocaleString()}
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

            {q.type === 'MULTIPLE_CHOICE_SINGLE' &&
              Array.isArray(q.choices) && (
                <>
                  <ul className='mt-2 list-none text-sm text-muted-foreground space-y-1'>
                    {q.choices.map((opt) => {
                      const relatedTagEntries =
                        opt.tagWeights && typeof opt.tagWeights === 'object'
                          ? (Object.entries(opt.tagWeights)
                              .map(([tagId, weight]) => {
                                const tag = assessment.tags.find(
                                  (t) => t.id === tagId,
                                )
                                return tag ? { name: tag.name, weight } : null
                              })
                              .filter(Boolean) as {
                              name: string
                              weight: number
                            }[])
                          : []

                      return (
                        <li key={opt.id}>
                          <div className='font-semibold'>
                            {opt.choiceId}. {opt.label}
                          </div>
                          {relatedTagEntries.length > 0 && (
                            <div className='flex flex-wrap gap-1 mt-1 ml-6'>
                              {relatedTagEntries.map(({ name, weight }) => (
                                <Badge
                                  key={name}
                                  className={`text-[10px] ${getBadgeClass(
                                    weight,
                                  )}`}
                                  title={`Weight: ${weight.toFixed(2)}`}
                                >
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}

            {q.type === 'ESSAY' && (
              <p className='mt-2 text-sm italic text-muted-foreground'>
                📝 Essay response expected.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
