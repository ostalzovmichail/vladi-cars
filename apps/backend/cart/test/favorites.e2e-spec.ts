import { Test, type TestingModule } from '@nestjs/testing'
import { type INestApplication } from '@nestjs/common'
import request from 'supertest'
import { JwtService } from '@nestjs/jwt'
import { CartModule } from '../src/cart.module'
import { PrismaService } from '../src/prisma.service'

describe('Favorites (e2e)', () => {
  let app: INestApplication
  let prisma: any
  let jwtService: JwtService
  let token: string

  const mockProduct = {
    id: 'prod-1',
    name: 'Test Part',
    price: 5000,
    images: [],
    category: 'engine',
    brand: 'Toyota',
    modelName: 'Camry',
    year: 2010,
    condition: 'used',
    inStock: true,
    description: '',
    currency: '₽',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockFavorite = {
    id: 'fav-1',
    userId: 'user-1',
    productId: 'prod-1',
    createdAt: new Date(),
    product: mockProduct,
  }

  beforeAll(async () => {
    prisma = {
      favorite: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
      product: {
        findUnique: jest.fn(),
      },
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CartModule],
    })
      .overrideProvider(PrismaService).useValue(prisma)
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    jwtService = moduleFixture.get(JwtService)
    token = jwtService.sign({ sub: 'user-1', email: 'test@test.com' })
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /favorites', () => {
    it('returns favorites for authenticated user', async () => {
      prisma.favorite.findMany.mockResolvedValue([mockFavorite])

      const res = await request(app.getHttpServer())
        .get('/favorites')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body).toHaveLength(1)
      expect(res.body[0].productId).toBe('prod-1')
    })

    it('returns empty array if no favorites', async () => {
      prisma.favorite.findMany.mockResolvedValue([])

      const res = await request(app.getHttpServer())
        .get('/favorites')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body).toHaveLength(0)
    })

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/favorites').expect(401)
    })
  })

  describe('POST /favorites', () => {
    it('adds a favorite', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct)
      prisma.favorite.upsert.mockResolvedValue(mockFavorite)

      await request(app.getHttpServer())
        .post('/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: 'prod-1' })
        .expect(201)
    })

    it('returns 404 for non-existent product', async () => {
      prisma.product.findUnique.mockResolvedValue(null)

      await request(app.getHttpServer())
        .post('/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: 'missing' })
        .expect(404)
    })

    it('returns 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/favorites')
        .send({ productId: 'prod-1' })
        .expect(401)
    })
  })

  describe('DELETE /favorites/:productId', () => {
    it('removes a favorite', async () => {
      prisma.favorite.deleteMany.mockResolvedValue({ count: 1 })

      await request(app.getHttpServer())
        .delete('/favorites/prod-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
    })

    it('returns 401 without token', async () => {
      await request(app.getHttpServer())
        .delete('/favorites/prod-1')
        .expect(401)
    })
  })
})
