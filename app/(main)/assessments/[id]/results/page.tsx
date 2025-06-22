import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getAssessmentById } from '@/lib/assessment'
import { getSubmissions } from '@/lib/submission'

type Props = {
  params: { id: string }
}

export default async function AssessmentResultsPage({ params }: Props) {
  const assessmentId = params.id
  const assessment = await getAssessmentById(assessmentId)
  if (!assessment) return notFound()

  const submissions = await getSubmissions(assessmentId)
  const allTagIds = assessment.tags.map((t) => t.id)
  const tagIdToName = Object.fromEntries(
    assessment.tags.map((t) => [t.id, t.name]),
  )

  return (
    <div className='max-w-6xl mx-auto px-4 py-10 space-y-10'>
      {/* Assessment Info */}
      <section className='space-y-2'>
        <h1 className='text-2xl font-bold'>
          {assessment.title || '(Untitled)'}
        </h1>
        <p className='text-muted-foreground text-sm'>
          Created at: {assessment.createdAt}
        </p>
        <div className='flex flex-wrap gap-2 mt-2'>
          {assessment.tags.map((t) => (
            <Badge key={t.id} variant='secondary'>
              {t.name}
            </Badge>
          ))}
        </div>
      </section>

      {/* Submissions Table */}
      <section className='space-y-4'>
        <h2 className='text-xl font-semibold'>Results</h2>

        {submissions.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No submissions yet.</p>
        ) : (
          <div className='overflow-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Answered At</TableHead>
                  {allTagIds.map((tagId) => (
                    <TableHead key={tagId}>{tagIdToName[tagId]}</TableHead>
                  ))}
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.user.name || s.user.email}</TableCell>
                    <TableCell>{s.completedAt?.toLocaleDateString()}</TableCell>
                    {allTagIds.map((tagId) => (
                      <TableCell key={tagId}>
                        {s.tagSummary?.[tagId]?.toFixed(2) ?? '-'}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Link
                        href={`/submissions/${s.id}`}
                        className='text-blue-600 hover:underline text-sm'
                      >
                        View →
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  )
}
