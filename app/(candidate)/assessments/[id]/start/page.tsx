'use client'

import { notFound, useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { isValidUUID } from '@/lib/validation'
import { Answers } from '@/lib/validation/assessmentSchema'
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
    const load = async () => {
      try {
        const res = await fetch(`/api/assessments/${id}`)
        if (!res.ok) {
          if (res.status === 404) {
            router.push('/not-found')
            return
          }
          throw new Error(`Failed to fetch assessment: ${res.statusText}`)
        }
        const data = await res.json()
        setAssessment(data.assessment)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, router])

  if (loading || !assessment) return <div className='p-6'>Loading...</div>

  const question = assessment.questions[currentIndex]
  const total = assessment.questions.length

  const toggleOrderedChoice = (choiceId: string) => {
    const questionId = question.id!

    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId)
      const maxOrderIndex = existing
        ? existing.selectedChoices?.length ?? -1
        : -1
      if (!existing) {
        return [
          ...prev,
          {
            questionId,
            selectedChoices: [{ choiceId, orderIndex: maxOrderIndex + 1 }],
          },
        ]
      }

      const existingChoices = existing.selectedChoices || []
      const index = existingChoices.findIndex((c) => c.choiceId === choiceId)
      let updatedChoices

      if (index !== -1) {
        updatedChoices = existingChoices
          .filter((c) => c.choiceId !== choiceId)
          .map((c, i) => ({ ...c, orderIndex: i }))
      } else if (existingChoices.length < 4) {
        updatedChoices = [
          ...existingChoices,
          { choiceId, orderIndex: existingChoices.length },
        ]
      } else {
        return prev // limit reached
      }

      const updated = {
        ...existing,
        selectedChoices: updatedChoices,
      }
      return prev.map((a) => (a.questionId === questionId ? updated : a))
    })
  }

  const currentAnswer = answers.find((a) => a.questionId === question.id)

  const handleNext = async () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1)
      return
    }

    const res = await fetch(`/api/assessments/${assessment.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
    if (!res.ok) {
      switch (res.status) {
        case 400:
          alert('Invalid answers. Please complete all required questions.')
          break
        case 403:
          router.push('/forbidden')
          break
        case 401:
          router.push('/login')
          break
        case 409:
          alert('You have already submitted this assessment.')
          break
        default:
          router.push('/error')
      }
    } else {
      router.push(`/assessments/${id}/completed`)
    }
  }

  const hasAnsweredCurrent = currentAnswer?.selectedChoices?.length === 4

  return (
    <div className='max-w-xl mx-auto p-6'>
      <h1 className='text-2xl font-semibold mb-4'>
        Question {currentIndex + 1} of {total}
      </h1>

      {question.type === 'MULTIPLE_CHOICE_ORDERED' && (
        <>
          <p className='mb-2 text-lg'>{question.question}</p>
          <p className='mb-4 text-sm text-gray-400'>
            Please select and order the choices by priority: 1 indicates the
            highest priority (most important), and 4 indicates the lowest
            priority.
          </p>
          <div className='flex flex-col gap-2'>
            {question.choices.map((choice) => {
              const selectedIndex =
                currentAnswer?.selectedChoices?.findIndex(
                  (c) => c.choiceId === choice.id,
                ) ?? -1
              const isSelected = selectedIndex !== -1
              return (
                <div key={choice.id} className='flex w-full'>
                  <div
                    role='button'
                    tabIndex={0}
                    onClick={() => toggleOrderedChoice(choice.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ')
                        toggleOrderedChoice(choice.id)
                    }}
                    className={`flex items-center w-full cursor-pointer rounded border px-4 py-2 text-left break-words focus:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                  >
                    {isSelected && (
                      <span className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold mr-3'>
                        {selectedIndex + 1}
                      </span>
                    )}
                    <div className='flex-1 break-words text-base'>
                      {choice.label}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
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
