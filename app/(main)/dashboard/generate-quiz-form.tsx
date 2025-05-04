'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function GenerateQuizForm() {
  const [text, setText] = useState('')
  const router = useRouter()

  const handleSend = async () => {
    const res = await fetch('/api/create-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    const { id } = await res.json()
    router.push(`/quiz/${id}`)
  }

  return (
    <div className='flex flex-col w-full gap-10'>
      <div className='flex flex-col gap-2'>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='e.g. "Sales quiz for applicants", or paste a job description URL.'
        />
        <Button className='cursor-pointer' onClick={handleSend}>
          Send
        </Button>
      </div>
    </div>
  )
}
