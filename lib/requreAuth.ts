import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { toUserDto, UserDto } from '@/types/user'
import { getUserByEmail } from './user'

export async function requireAuth(): Promise<UserDto> {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/')
  }

  const user = await getUserByEmail(session.user.email!)
  if (!user) {
    // DBに登録されていない or 作成中のユーザー
    redirect('/signup') // 👈 適切な初期セットアップページに飛ばす
  }

  // ここで companyId が null/undefined なら onboarding に飛ばす
  if (!user.companies || user.companies.length === 0) {
    redirect('/onboarding') // 👈 最初のcompany作成 or 選択
  }

  return toUserDto(user, session.user.companyId)
}
