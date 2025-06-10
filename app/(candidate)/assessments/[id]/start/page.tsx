'use client'

import { notFound, useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { getNowByServer, setServerTime } from '@/lib/utils/time'
import { isValidUUID } from '@/lib/validation'
import { Answers, Choice } from '@/lib/validation/assessmentSchema'
import { AssessmentDto } from '@/types/assessment'

export default function AssessmentStartPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  if (!isValidUUID(id)) notFound()

  const [assessment, setAssessment] = useState<AssessmentDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>([])

  useEffect(() => {
    fetch(`/api/assessments/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setAssessment(data.assessment)
        setServerTime(data.serverTime) // サーバー時刻を初期化
      })
      .then(() => setLoading(false))
  }, [id])

  if (loading || !assessment) return <div className='p-6'>Loading...</div>

  const question = assessment.questions[currentIndex]
  const total = assessment.questions.length

  const handleSelect = (choiceId: string) => {
    const questionId = question.id!
    const answeredAt = getNowByServer()

    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId)
      const updated = { questionId, choiceId, answeredAt }

      if (existing) {
        return prev.map((a) => (a.questionId === questionId ? updated : a))
      } else {
        return [...prev, updated]
      }
    })
  }

  const currentAnswer =
    answers.find((a) => a.questionId === question.id)?.choiceId || ''

  const handleNext = async () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1)
      return
    }

    await fetch(`/api/assessments/${assessment.id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers }),
    })
    router.push('/completed')
  }

  const hasAnsweredCurrent = answers.some(
    (a) => a.questionId === question.id && a.choiceId,
  )

  return (
    <div className='max-w-xl mx-auto p-6'>
      <h1 className='text-2xl font-semibold mb-4'>
        Question {currentIndex + 1} of {total}
      </h1>

      {question.type === 'MULTIPLE_CHOICE_SINGLE' && (
        <>
          <p className='mb-4 text-lg'>{question.question}</p>
          <RadioGroup
            className='space-y-3'
            value={currentAnswer}
            onValueChange={handleSelect}
          >
            {question.choices.map((choice: Choice) => (
              <div key={choice.id} className='flex items-center space-x-3'>
                <RadioGroupItem value={choice.id} id={choice.id} />
                <Label htmlFor={choice.id}>{choice.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </>
      )}

      <Button
        className='mt-6'
        onClick={handleNext}
        disabled={!hasAnsweredCurrent}
      >
        {currentIndex === total - 1 ? 'Submit' : 'Next'}
      </Button>
    </div>
  )
}
