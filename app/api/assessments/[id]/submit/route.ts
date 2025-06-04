import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = await params
  const body = await req.json()
  const { answers } = body
  return NextResponse.json({ message: 'Assessment submitted successfully' })
}
