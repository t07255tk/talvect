import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { toUserDto, UserDto } from '@/types/user'
import { getUserByEmail } from './user'

export async function requireAuth(): Promise<UserDto> {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/')
  if (!session.user) redirect('/')
  const user = await getUserByEmail(session.user.email!)
  if (!user) redirect('/')
  return toUserDto(user)
}
