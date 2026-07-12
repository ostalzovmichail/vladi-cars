import { Test, type TestingModule } from '@nestjs/testing'
import { type INestApplication } from '@nestjs/common'
import request from 'supertest'
import { JwtService } from '@nestjs/jwt'
import { CatalogModule } from '../src/catalog.module'
import { PrismaService } from '../src/prisma.service'

describe('Reviews (e2e)', () => {
  let app: INestApplication
  let prisma: any
  let jwtService: JwtService
  let token: string

  const mockProduct = {
    id: 'prod-1',
    name: 'Test Part',
    description: '',
    price: 5000,
    currency: '₽',
    images: [],
    category: 'engine',
    brand: 'Toyota',
    modelName: 'Camry',
    year: 2010,
    condition: 'used',
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockReview = {
    id: 'rev-1',
    userId: 'user-1',
    productId: 'prod-1',
    rating: 5,
    text: 'Great part!',
    createdAt: new Date('2024-01-01'),
  }

  beforeAll(async () => {
    prisma = {
      product: {
        findUnique: jest.fn(),
      },
      review: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CatalogModule],
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

  describe('GET /products/:id/reviews', () => {
    it('returns reviews for a product', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct)
      prisma.review.findMany.mockResolvedValue([mockReview])

      const res = await request(app.getHttpServer())
        .get('/products/prod-1/reviews')
        .expect(200)

      expect(res.body).toHaveLength(1)
      expect(res.body[0].rating).toBe(5)
      expect(res.body[0].text).toBe('Great part!')
    })

    it('returns 404 if product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null)

      await request(app.getHttpServer())
        .get('/products/missing/reviews')
        .expect(404)
    })

    it('returns empty array if no reviews', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct)
      prisma.review.findMany.mockResolvedValue([])

      const res = await request(app.getHttpServer())
        .get('/products/prod-1/reviews')
        .expect(200)

      expect(res.body).toHaveLength(0)
    })

    it('works without auth', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct)
      prisma.review.findMany.mockResolvedValue([])

      await request(app.getHttpServer())
        .get('/products/prod-1/reviews')
        .expect(200)
    })
  })

  describe('POST /products/:id/reviews', () => {
    it('creates a review when authenticated', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct)
      prisma.review.create.mockResolvedValue(mockReview)

      const res = await request(app.getHttpServer())
        .post('/products/prod-1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5, text: 'Great part!' })
        .expect(201)

      expect(res.body.rating).toBe(5)
      expect(res.body.text).toBe('Great part!')
    })

    it('returns 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/products/prod-1/reviews')
        .send({ rating: 5, text: 'Great!' })
        .expect(401)
    })

    it('returns 404 if product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null)

      await request(app.getHttpServer())
        .post('/products/missing/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5, text: 'Great!' })
        .expect(404)
    })
  })
})
