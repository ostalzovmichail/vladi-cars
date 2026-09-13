import { Test, type TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { AuthService } from './auth.service'
import { PrismaService } from './prisma.service'

jest.mock('bcrypt')

const mockUser = {
  id: 'user-1',
  name: 'Test',
  email: 'test@test.com',
  phone: null,
  passwordHash: 'hashed-pass',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('AuthService', () => {
  let service: AuthService
  let prisma: any
  let jwtService: JwtService

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock-token') },
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    jwtService = module.get<JwtService>(JwtService)
  })

  describe('register', () => {
    it('creates a new user and returns token', async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue(mockUser)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pass')

      const result = await service.register({
        name: 'Test',
        email: 'test@test.com',
        password: 'secret',
      })

      expect(result.token).toBe('mock-token')
      expect(result.user.email).toBe('test@test.com')
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@test.com',
            passwordHash: 'hashed-pass',
          }),
        }),
      )
    })

    it('throws ConflictException if email exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser)

      await expect(
        service.register({ name: 'Test', email: 'test@test.com', password: 'secret' }),
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('login', () => {
    it('returns token for valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await service.login({ email: 'test@test.com', password: 'secret' })

      expect(result.token).toBe('mock-token')
      expect(result.user.email).toBe('test@test.com')
    })

    it('throws UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      await expect(
        service.login({ email: 'missing@test.com', password: 'secret' }),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('throws UnauthorizedException if password wrong', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('validateUser', () => {
    it('returns safe user data if found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await service.validateUser('user-1')

      expect(result).toEqual({
        id: 'user-1',
        name: 'Test',
        email: 'test@test.com',
        phone: undefined,
      })
    })

    it('returns null if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      const result = await service.validateUser('missing')
      expect(result).toBeNull()
    })
  })
})
