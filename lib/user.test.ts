import { Prisma, User as PrismaUser, Role } from '@prisma/client'
import { User as NextAuthUser } from 'next-auth'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/prisma/client'
import {
  assignUserToCompany,
  createCompanyAndAssignUser,
  createUserIfNotExists,
  getUserByEmail,
} from './user'
import * as userModule from './user'

vi.mock('@/prisma/client', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    userCompany: {
      upsert: vi.fn(),
    },
    $transaction: vi.fn((fn) => {
      fn({
        userCompany: {
          upsert: vi.fn(),
        },
      })
    }),
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

const mockCompanyId = 'company-456'
const mockUserId = 'user123'
const mockRole = Role.admin
const userCompanyPayload = {
  user_id: mockUserId,
  company_id: mockCompanyId,
  role: mockRole,
}
describe('assignUserToCompany', () => {
  const mockUpsert = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should upsert user company role using default prisma (no tx)', async () => {
    prisma.userCompany.upsert = mockUpsert
    mockUpsert.mockResolvedValue(userCompanyPayload)

    const result = await assignUserToCompany(
      mockUserId,
      mockCompanyId,
      mockRole,
    )

    expect(mockUpsert).toHaveBeenCalledWith({
      where: {
        user_id_company_id: {
          user_id: mockUserId,
          company_id: mockCompanyId,
        },
      },
      update: { role: mockRole },
      create: {
        user_id: mockUserId,
        company_id: mockCompanyId,
        role: mockRole,
      },
    })

    expect(result).toEqual(userCompanyPayload) // upsert returns the created/updated record, but we don't care about it in this test
  })

  it('should upsert user company role using passed tx', async () => {
    const result = await assignUserToCompany(
      mockUserId,
      mockCompanyId,
      mockRole,
      {
        userCompany: { upsert: mockUpsert },
      } as unknown as Prisma.TransactionClient,
    )

    expect(mockUpsert).toHaveBeenCalledWith({
      where: {
        user_id_company_id: {
          user_id: mockUserId,
          company_id: mockCompanyId,
        },
      },
      update: { role: mockRole },
      create: {
        user_id: mockUserId,
        company_id: mockCompanyId,
        role: mockRole,
      },
    })

    expect(result).toEqual(userCompanyPayload)
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

    vi.spyOn(userModule, 'assignUserToCompany').mockResolvedValue(
      userCompanyPayload,
    )
  })

  it('should create a company and assign the user as admin', async () => {
    mockCreate.mockResolvedValue({
      id: 'company-456',
      name: "Test User's Company",
    })

    const result = await createCompanyAndAssignUser(mockPrismaUser)

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        name: "Test User's Company",
        users: {
          create: { user_id: 'user123' },
        },
      },
    })

    expect(userModule.assignUserToCompany).toHaveBeenCalledWith(
      mockUserId,
      mockCompanyId,
      Role.admin,
      expect.anything(),
    )

    expect(result).toEqual({ id: 'company-456', name: "Test User's Company" })
  })
})
