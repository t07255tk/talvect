'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from './ui/button'

export default function AuthButton() {
  const { data: session } = useSession()
  if (session) {
    return (
      <div>
        <h1>こんにちは {session.user?.name} さん！</h1>
        <Button className='cursor-pointer' onClick={() => signOut()}>
          ログアウト
        </Button>
      </div>
    )
  } else {
    return (
      <div>
        <h1>ログインしてないよ</h1>
        <Button className='cursor-pointer' onClick={() => signIn('google')}>
          Googleでログイン
        </Button>
      </div>
    )
  }
}
