import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { getSubmissionById } from '@/lib/submission'

function getBadgeClass(weight: number) {
  if (weight >= 0.75) return 'bg-red-500 text-white'
  if (weight >= 0.5) return 'bg-orange-400 text-black'
  if (weight >= 0.25) return 'bg-yellow-300 text-black'
  if (weight > 0) return 'bg-gray-300 text-gray-800'
  return 'bg-muted text-muted-foreground'
}

type Props = {
  params: { id: string }
}

export default async function SubmissionDetailPage({ params }: Props) {
  const submission = await getSubmissionById(params.id)
  if (!submission) return notFound()

  return (
    <div className='max-w-5xl mx-auto px-4 py-10 space-y-10'>
      {/* Header */}
      <section className='space-y-2'>
        <h1 className='text-2xl font-bold'>Submission Detail</h1>
        <p className='text-muted-foreground text-sm'>
          Assessment: {submission.assessment.title || '(Untitled)'}
        </p>
        <p className='text-sm'>
          User: {submission.user.name || submission.user.email}
        </p>
        <p className='text-sm text-muted-foreground'>
          Answered: {submission.completedAt?.toLocaleDateString()}
        </p>
      </section>

      {/* Tag Summary */}
      <section className='space-y-2'>
        <h2 className='text-xl font-semibold'>Tag Summary</h2>
        <div className='flex flex-wrap gap-2'>
          {Object.entries(submission.tagSummary).map(([tagId, score]) => (
            <Badge key={tagId} variant='secondary'>
              {tagId}: {score.toFixed(2)}
            </Badge>
          ))}
        </div>
      </section>

      {/* Answers */}
      <section className='space-y-4'>
        <h2 className='text-xl font-semibold'>Answers</h2>
        {submission.userAnswers.map((ua) => (
          <Card key={ua.id} className='p-4 space-y-2'>
            <div className='font-medium'>{ua.question.question}</div>
            {ua.userAnswerChoices?.map((c) => (
              <div key={c.id} className='ml-2'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium'>
                    {c.orderIndex + 1}: {c.choice.label}
                  </span>
                  <div className='flex flex-wrap gap-1'>
                    {c.choice.tagWeights?.map((tw) => (
                      <Badge
                        key={tw.tag.id}
                        className={getBadgeClass(tw.weight)}
                      >
                        {tw.tag.name}: {tw.weight.toFixed(2)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        ))}
      </section>
    </div>
  )
}
