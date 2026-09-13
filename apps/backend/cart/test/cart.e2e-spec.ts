import { Test, type TestingModule } from '@nestjs/testing'
import { type INestApplication } from '@nestjs/common'
import request from 'supertest'
import { JwtService } from '@nestjs/jwt'
import { CartModule } from '../src/cart.module'
import { PrismaService } from '../src/prisma.service'

describe('Cart (e2e)', () => {
  let app: INestApplication
  let prisma: any
  let jwtService: JwtService
  let token: string

  const mockProduct = {
    id: 'prod-1',
    name: 'Test Part',
    price: 5000,
    inStock: true,
    category: 'engine',
    description: '',
    currency: '₽',
    images: [],
    brand: 'Toyota',
    modelName: 'Camry',
    year: 2010,
    condition: 'used',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockCartItem = {
    id: 'ci-1',
    cartId: 'cart-1',
    productId: 'prod-1',
    quantity: 2,
    product: mockProduct,
  }

  const mockCart = {
    id: 'cart-1',
    userId: 'user-1',
    items: [mockCartItem],
  }

  beforeAll(async () => {
    prisma = {
      cart: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      cartItem: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
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

  describe('GET /cart', () => {
    it('returns cart for authenticated user', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart)

      const res = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body.items).toHaveLength(1)
      expect(res.body.total).toBe(10000)
    })

    it('returns empty cart if none exists', async () => {
      prisma.cart.findUnique.mockResolvedValue(null)

      const res = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body.items).toHaveLength(0)
    })

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/cart').expect(401)
    })
  })

  describe('POST /cart/items', () => {
    it('adds item to cart', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct)
      prisma.cart.findUnique.mockResolvedValueOnce(null)
      prisma.cart.create.mockResolvedValue(mockCart)
      prisma.cartItem.findUnique.mockResolvedValue(null)
      prisma.cartItem.create.mockResolvedValue(mockCartItem)
      prisma.cart.findUnique.mockResolvedValueOnce(mockCart)

      const res = await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: 'prod-1', quantity: 2 })
        .expect(201)

      expect(res.body.items).toHaveLength(1)
    })

    it('returns 404 for non-existent product', async () => {
      prisma.product.findUnique.mockResolvedValue(null)

      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: 'missing', quantity: 1 })
        .expect(404)
    })
  })

  describe('PATCH /cart/items/:productId', () => {
    it('updates item quantity', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart)
      prisma.cartItem.findUnique.mockResolvedValue(mockCartItem)
      prisma.cart.findUnique.mockResolvedValueOnce(mockCart)

      await request(app.getHttpServer())
        .patch('/cart/items/prod-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 5 })
        .expect(200)
    })
  })

  describe('DELETE /cart/items/:productId', () => {
    it('removes item from cart', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart)
      prisma.cartItem.findUnique.mockResolvedValue(mockCartItem)
      prisma.cart.findUnique.mockResolvedValueOnce(mockCart)

      await request(app.getHttpServer())
        .delete('/cart/items/prod-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
    })
  })

  describe('DELETE /cart', () => {
    it('clears the cart', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart)

      await request(app.getHttpServer())
        .delete('/cart')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
    })
  })
})
