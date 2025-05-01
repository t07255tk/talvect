import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createUserIfNotExists } from './user'
import prisma from '@/prisma/client'
import { User as PrismaUser } from '@prisma/client'
import { User as NextAuthUser } from 'next-auth'

vi.mock('@/prisma/client', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('createUserIfNotExists', () => {
  const inputUser: NextAuthUser = {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/icon.png',
  }

  const mockPrismaUser: PrismaUser = {
    id: 'user123',
    email: inputUser.email!,
    name: inputUser.name!,
    image: inputUser.image!,
    hashed_password: null,
    provider: '',
    provider_id: null,
    role: null,
    created_at: null,
    updated_at: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns existing user if already exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockPrismaUser)

    const result = await createUserIfNotExists(inputUser)

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: inputUser.email! },
    })
    expect(prisma.user.create).not.toHaveBeenCalled()
    expect(result).toEqual(mockPrismaUser)
  })

  it('creates and returns new user if not exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)
    vi.mocked(prisma.user.create).mockResolvedValueOnce(mockPrismaUser)

    const result = await createUserIfNotExists(inputUser)

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: inputUser.email! },
    })
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: inputUser.email!,
        name: inputUser.name!,
        image: inputUser.image!,
      },
    })
    expect(result).toEqual(mockPrismaUser)
  })
})
