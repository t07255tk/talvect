import { requireAuth } from '@/lib/requreAuth'
import getAvailableTags from '@/lib/tags'
import GenerateAssessmentForm from './TagSelector'

export default async function Page() {
  const { id: userId } = await requireAuth()
  const tags = await getAvailableTags(userId)
  return (
    <div className='flex flex-col items-center w-full gap-10 px-4 py-12'>
      <div className='text-center'>
        <div className='text-2xl font-semibold'>Create New Assessment</div>
        <p className='text-muted-foreground text-sm mt-2'>
          Select 3 to 6 traits you'd like to evaluate.
        </p>
      </div>
      <div className='lg:w-1/2 md:w-2/3 w-full'>
        <GenerateAssessmentForm initialTags={tags} />
      </div>
    </div>
  )
}
