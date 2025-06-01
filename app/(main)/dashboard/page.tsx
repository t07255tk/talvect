import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getAssessments } from '@/lib/assessment'
import { requireAuth } from '@/lib/requreAuth'
import { getCompanyForUser } from '@/lib/company'
import { createCompanyAndAssignUser } from '@/lib/user'

export default async function Page() {
  const user = await requireAuth()
  const assessments = await getAssessments(user.id)
  const company = await getCompanyForUser(user.id)
  if (!company) {
    await createCompanyAndAssignUser(user)
  }

  return (
    // TODO: implement this page at final
    <div className='flex flex-col items-center w-full px-4 py-12'>
      <div className='lg:text-6xl md:text-4xl text-2xl font-bold'>
        Evaluate talent. Instantly.
      </div>
      <p className='text-muted-foreground text-sm mt-2'>
        Select **3 to 6 tags** that describe your ideal candidate — Talvect will
        automatically generate an AI-powered screening test.
      </p>
      <p className='text-sm text-muted-foreground mt-1'>
        No forms, no prompt writing — just choose the qualities you value. You
        can refine the questions anytime.
      </p>

      <div className='w-full max-w-2xl mt-12'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold'>Your Assessments</h2>
          <Button asChild>
            <Link href='/generate-assessment'>+ New Assessment</Link>
          </Button>
        </div>

        {assessments.length === 0 ? (
          <p className='text-muted-foreground text-sm'>
            No assessments yet. Click “New Assessment” to create one.
          </p>
        ) : (
          <div className='space-y-4'>
            {assessments.map((a) => (
              <Link
                key={a.id}
                href={`/assessments/${a.id}`}
                className='block border rounded-xl p-4 hover:bg-accent transition'
              >
                <div className='text-lg font-semibold'>{a.title}</div>
                <div className='text-sm text-muted-foreground'>
                  {a.description || 'No description'}
                </div>
                <div className='text-xs text-right text-gray-500'>
                  {a.questions.length} questions
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
