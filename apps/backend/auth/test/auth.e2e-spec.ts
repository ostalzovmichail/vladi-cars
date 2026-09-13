import { Test, type TestingModule } from '@nestjs/testing'
import { type INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AuthModule } from '../src/auth.module'
import { PrismaService } from '../src/prisma.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { HttpExceptionFilter } from '../src/http-exception.filter'

jest.mock('bcrypt')

describe('Auth (e2e)', () => {
  let app: INestApplication
  let prisma: any
  let jwtService: JwtService

  beforeAll(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      passwordResetToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(PrismaService).useValue(prisma)
      .compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    app.useGlobalFilters(new HttpExceptionFilter())
    await app.init()
    jwtService = moduleFixture.get(JwtService)
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /auth/register', () => {
    it('registers a new user', async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue({
        id: 'new-id',
        name: 'Test',
        email: 'test@test.com',
        phone: null,
        passwordHash: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed')

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'secret' })
        .expect(201)

      expect(res.body.user.email).toBe('test@test.com')
      expect(res.body.token).toBeDefined()
    })

    it('returns 409 if email already registered', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' })

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test', email: 'existing@test.com', password: 'secret' })
        .expect(409)
    })
  })

  describe('POST /auth/login', () => {
    it('returns token for valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Test',
        email: 'test@test.com',
        phone: null,
        passwordHash: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'secret' })
        .expect(201)

      expect(res.body.token).toBeDefined()
    })

    it('returns 401 for wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', passwordHash: 'hashed' })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' })
        .expect(401)
    })
  })

  describe('POST /auth/forgot-password', () => {
    it('sends reset token for registered email', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'test@test.com' })
      prisma.passwordResetToken.create.mockResolvedValue({ token: 'mock-token' })

      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'test@test.com' })
        .expect(201)

      expect(res.body.token).toBeDefined()
      expect(res.body.message).toBeDefined()
    })

    it('returns message even for unregistered email', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'unknown@test.com' })
        .expect(201)

      expect(res.body.token).toBeUndefined()
    })
  })

  describe('POST /auth/reset-password', () => {
    it('resets password with valid token', async () => {
      const future = new Date(Date.now() + 3600000)
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'token-1',
        email: 'test@test.com',
        token: 'valid-token',
        expiresAt: future,
        used: false,
      })
      prisma.user.update.mockResolvedValue({})
      prisma.passwordResetToken.update.mockResolvedValue({})
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed')

      const res = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: 'valid-token', password: 'newpass123' })
        .expect(201)

      expect(res.body.message).toBeDefined()
    })

    it('returns 400 for invalid token', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue(null)

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: 'bad-token', password: 'newpass123' })
        .expect(400)
    })
  })

  describe('GET /auth/me', () => {
    it('returns user data with valid token', async () => {
      const token = jwtService.sign({ sub: 'user-1', email: 'test@test.com' })

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Test',
        email: 'test@test.com',
        phone: '123',
      })

      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body.email).toBe('test@test.com')
    })

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401)
    })
  })
})
