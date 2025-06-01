import { Prisma, User as PrismaUser, Role } from '@prisma/client'
import { User as NextAuthUser } from 'next-auth'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/prisma/client'
import {
  createCompanyAndAssignUser,
  createUserIfNotExists,
  getUserByEmail,
} from './user'

vi.mock('@/prisma/client', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

const mockPrismaUser: PrismaUser = {
  id: 'user123',
  email: 'test@example.com',
  name: 'Test User',
  image: 'https://example.com/icon.png',
  hashed_password: null,
  provider: '',
  provider_id: null,
  created_at: null,
  updated_at: null,
}

describe('createUserIfNotExists', () => {
  const inputUser: NextAuthUser = {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/icon.png',
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

describe('getUserByEmail', () => {
  it('getUserByEmail returns user if found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockPrismaUser)

    const result = await getUserByEmail('test@example.com')

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    })
    expect(result).toEqual(mockPrismaUser)
  })
})

describe('createCompanyAndAssignUser', () => {
  const mockCreate = vi.fn()
  const mockUpsert = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(prisma, '$transaction').mockImplementation(async (fn) => {
      return await fn({
        company: { create: mockCreate },
        userCompany: { upsert: mockUpsert },
      } as unknown as Prisma.TransactionClient)
    })
  })

  it('should create a company and assign the user as admin', async () => {
    mockCreate.mockResolvedValue({
      id: 'company-456',
      name: "Test User's Company",
    })
    mockUpsert.mockResolvedValue({})

    const result = await createCompanyAndAssignUser(mockPrismaUser)

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        name: "Test User's Company",
        users: {
          create: { user_id: 'user123' },
        },
      },
    })

    expect(mockUpsert).toHaveBeenCalledWith({
      where: {
        user_id_company_id: {
          user_id: 'user123',
          company_id: 'company-456',
        },
      },
      update: { role: Role.admin },
      create: {
        user_id: 'user123',
        company_id: 'company-456',
        role: Role.admin,
      },
    })

    expect(result).toEqual({ id: 'company-456', name: "Test User's Company" })
  })
})
