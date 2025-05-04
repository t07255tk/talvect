'use client'
import { ModeToggle } from './ModeToggle'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSession } from 'next-auth/react'

export default function Header() {
  const { data: session } = useSession()
  const userImage = session?.user?.image ?? ''
  return (
    <header className='flex p-2 border-b'>
      <nav className='w-full flex items-center justify-between'>
        <span className='font-bold'>Evalent8</span>
        <div className='flex gap-2'>
          <ModeToggle />
          <Avatar>
            <AvatarImage src={userImage} />
            <AvatarFallback />
          </Avatar>
        </div>
      </nav>
    </header>
  )
}
