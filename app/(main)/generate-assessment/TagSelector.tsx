'use client'

import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TagDto } from '@/types/tag'

export default function TagSelector({
  initialTags,
}: {
  initialTags: TagDto[]
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [hoveredTag, setHoveredTag] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id)
        ? prev.filter((t) => t !== id)
        : prev.length < 6
        ? [...prev, id]
        : prev,
    )
  }

  const filteredTags = initialTags.filter((tag) =>
    tag.name.toLowerCase().includes(inputValue.toLowerCase()),
  )

  const selectedTagObjects = initialTags.filter((tag) =>
    selectedTags.includes(tag.id),
  )

  const handleGenerate = async () => {
    fetch('/api/generate-assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags: selectedTags }),
    })
      .then((res) => {
        if (!res.ok) {
          console.error('Failed to generate assessment')
        }
        return res.json()
      })
      .then((data) => {
        console.log('Generated Assessment:', data.assessment)
      })
  }

  return (
    <div className='space-y-4'>
      <div className='text-lg font-medium'>Select 3 to 6 tags</div>

      <div className='flex flex-wrap gap-2'>
        {selectedTagObjects.map((tag) => (
          <div
            key={tag.id}
            className='flex items-center gap-1 bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm'
          >
            {tag.name}
            <button
              className='ml-1 text-muted-foreground cursor-pointer hover:text-primary'
              onClick={() => toggleTag(tag.id)}
            >
              <X className='h-3 w-3' />
            </button>
          </div>
        ))}
      </div>

      <input
        type='text'
        placeholder='Search tags...'
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className='w-full px-3 py-2 border rounded-md shadow-sm'
      />

      <div className='max-h-60 overflow-y-auto border rounded-lg p-2 bg-background space-y-1'>
        {filteredTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id)
          const isDisabled = !isSelected && selectedTags.length >= 6
          const isHovered = hoveredTag === tag.id

          return (
            <div
              key={tag.id}
              onClick={() => !isDisabled && toggleTag(tag.id)}
              onMouseEnter={() => setHoveredTag(tag.id)}
              onMouseLeave={() => setHoveredTag(null)}
              className={cn(
                'flex items-start justify-between px-3 py-2 rounded-md cursor-pointer transition-all select-none flex-col sm:flex-row sm:items-center sm:gap-2',
                isSelected
                  ? 'bg-muted text-muted-foreground'
                  : isHovered
                  ? 'bg-muted/50'
                  : '',
                isDisabled && 'opacity-40 cursor-not-allowed',
              )}
            >
              <div className='flex-1'>
                <div className='font-medium text-sm'>{tag.name}</div>
                {tag.description && (
                  <div className='text-xs text-muted-foreground'>
                    {tag.description}
                  </div>
                )}
              </div>
              {isSelected && (
                <Check className='h-4 w-4 text-primary self-center' />
              )}
            </div>
          )
        })}
      </div>

      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          {selectedTags.length} / 6 selected
        </p>
        <Button disabled={selectedTags.length < 3} onClick={handleGenerate}>
          Generate Assessment
        </Button>
      </div>
    </div>
  )
}
