import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFoundContent() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center px-4 text-center'>
      <h1 className='text-5xl font-bold tracking-tight mb-4'>404</h1>
      <p className='text-lg text-muted-foreground mb-6'>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild>
        <Link href='/dashboard'>← Back to Dashboard</Link>
      </Button>
    </div>
  )
}
