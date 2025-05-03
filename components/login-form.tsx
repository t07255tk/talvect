'use client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  return (
    <form className={cn('flex flex-col gap-6', className)} {...props}>
      <div className='flex flex-col items-center gap-2 text-center'>
        <h1 className='text-2xl font-bold'>Login to your account</h1>
      </div>
      <div className='grid gap-6'>
        <Button
          type='button'
          variant='outline'
          className='w-full cursor-pointer'
          onClick={() => signIn('google')}
        >
          Login with Google
        </Button>
      </div>
    </form>
  )
}
