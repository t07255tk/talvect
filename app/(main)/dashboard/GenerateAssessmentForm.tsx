'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function GenerateAssessmentForm() {
  const [text, setText] = useState('')
  const router = useRouter()

  const handleSend = async () => {
    const res = await fetch('/api/generate-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    if (!res.ok) {
      console.error('Failed to generate assessment')
      return
    }

    const data = await res.json()
    const { id } = data

    router.push(`/assessments/${id}`)
  }

  return (
    <div className='flex flex-col w-full gap-10'>
      <div className='flex flex-col gap-2'>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='e.g. Generate an assessment for sales candidates or paste a job description URL.'
        />
        <Button className='cursor-pointer' onClick={handleSend}>
          Generate Assessment
        </Button>
      </div>
    </div>
  )
}
