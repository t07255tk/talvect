import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getAssessments } from '@/lib/assessment'
import { requireAuth } from '@/lib/requreAuth'
import { Badge } from '@/components/ui/badge'

export default async function Page() {
  const user = await requireAuth()
  const assessments = await getAssessments(user.id)

  return (
    <div className='w-full max-w-5xl mx-auto px-4 py-12'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-2xl font-bold'>Your Assessments</h1>
        <Button asChild>
          <Link href='/generate-assessment'>+ New Assessment</Link>
        </Button>
      </div>

      {assessments.length === 0 ? (
        <div className='text-center text-muted-foreground text-sm'>
          No assessments yet. Click “New Assessment” to create one.
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {assessments.map((a) => (
            <Link
              key={a.id}
              href={`/assessments/${a.id}`}
              className='border rounded-xl p-4 hover:bg-accent transition block'
            >
              <div className='text-lg font-semibold line-clamp-1'>
                {a.title?.trim() || '(Untitled Assessment)'}
              </div>
              <div className='flex flex-wrap items-center gap-2 mt-2'>
                {a.tags.map((t) => (
                  <Badge key={t.id} variant='secondary'>
                    {t.name}
                  </Badge>
                ))}
              </div>

              <div className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                {a.description?.trim() || 'No description'}
              </div>
              <div className='text-xs text-right text-gray-500 mt-4'>
                Created: {new Date(a.createdAt).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
