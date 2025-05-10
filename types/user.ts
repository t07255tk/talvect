import type { User } from '@prisma/client'

export type UserDto = {
  id: string
  email: string
  name: string | null
  image: string | null
}

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  }
}
