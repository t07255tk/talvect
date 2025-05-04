import { requireAuth } from '@/lib/requreAuth'
import GenerateQuizForm from './generate-quiz-form'

export default async function Page() {
  await requireAuth()

  return (
    <div className='flex flex-col items-center w-full gap-10 px-4 py-12'>
      <div className='text-center'>
        <div className='lg:text-6xl md:text-4xl text-2xl font-bold'>
          Evaluate talent. Instantly.
        </div>
        <p className='text-muted-foreground text-sm mt-2'>
          Enter a topic or paste a URL — Evalent8 will generate a smart quiz you
          can use to screen, train, or assess.
        </p>
        <p className='text-sm text-muted-foreground mt-1'>
          No setup, no forms — just describe what you want to ask. You can
          refine the quiz anytime.
        </p>
      </div>
      <div className='lg:w-1/2 md:w-2/3 w-full'>
        <GenerateQuizForm />
      </div>
    </div>
  )
}
