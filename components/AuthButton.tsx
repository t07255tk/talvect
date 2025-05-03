'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from './ui/button'

export default function AuthButton() {
  const { data: session } = useSession()
  if (session) {
    return (
      <div>
        <Button
          className='cursor-pointer'
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          ログアウト
        </Button>
      </div>
    )
  } else {
    return (
      <div>
        <Button className='cursor-pointer' onClick={() => signIn('google')}>
          Googleでログイン
        </Button>
      </div>
    )
  }
}
