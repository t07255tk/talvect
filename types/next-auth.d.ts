import { Company } from '@prisma/client'
import { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      companyId?: string
    }
  }

  interface User extends DefaultUser {
    companyId?: string
    companies?: Company[]
  }
}
