import type { User } from '@prisma/client'

export type UserDto = {
  id: string
  email: string
  name: string | null
  image: string | null
  companyId?: string
}

export function toUserDto(user: User, companyId?: string): UserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    companyId,
  }
}
