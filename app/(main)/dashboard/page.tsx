import { requireAuth } from '@/lib/requreAuth'

export default async function Page() {
  await requireAuth()
  return <div></div>
}
