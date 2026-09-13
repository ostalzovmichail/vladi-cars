import { Test, type TestingModule } from '@nestjs/testing'
import { type INestApplication } from '@nestjs/common'
import request from 'supertest'
import { JwtService } from '@nestjs/jwt'
import { OrdersModule } from '../src/orders.module'
import { PrismaService } from '../src/prisma.service'

describe('Orders (e2e)', () => {
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
  }

  const mockCart = {
    id: 'cart-1',
    userId: 'user-1',
    items: [mockCartItem],
  }

  const mockOrder = {
    id: 'order-1',
    userId: 'user-1',
    status: 'pending',
    total: 10000,
    createdAt: new Date('2024-01-01'),
    items: [
      {
        id: 'oi-1',
        productId: 'prod-1',
        name: 'Test Part',
        price: 5000,
        quantity: 2,
      },
    ],
  }

  beforeAll(async () => {
    prisma = {
      cart: {
        findUnique: jest.fn(),
      },
      product: {
        findMany: jest.fn(),
      },
      order: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      cartItem: {
        deleteMany: jest.fn(),
      },
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OrdersModule],
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

  describe('POST /orders', () => {
    it('creates order from cart', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart)
      prisma.product.findMany.mockResolvedValue([mockProduct])
      prisma.order.create.mockResolvedValue(mockOrder)

      const res = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(201)

      expect(res.body.id).toBe('order-1')
      expect(res.body.items).toHaveLength(1)
      expect(res.body.total).toBe(10000)
    })

    it('returns 400 if cart is empty', async () => {
      prisma.cart.findUnique.mockResolvedValue({ ...mockCart, items: [] })

      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
    })

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).post('/orders').expect(401)
    })
  })

  describe('GET /orders', () => {
    it('returns user orders', async () => {
      prisma.order.findMany.mockResolvedValue([mockOrder])

      const res = await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body).toHaveLength(1)
    })

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/orders').expect(401)
    })
  })

  describe('GET /orders/:id', () => {
    it('returns order by id', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder)

      const res = await request(app.getHttpServer())
        .get('/orders/order-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body.id).toBe('order-1')
    })

    it('returns 404 if not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null)

      await request(app.getHttpServer())
        .get('/orders/missing')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
    })
  })

  describe('GET /orders/admin', () => {
    it('returns all orders for admin', async () => {
      const adminToken = jwtService.sign({ sub: 'admin-1', email: 'admin@test.com', role: 'admin' })

      prisma.order.findMany.mockResolvedValue([{
        ...mockOrder,
        user: { name: 'Test', email: 'test@test.com' },
      }])

      const res = await request(app.getHttpServer())
        .get('/orders/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(res.body).toHaveLength(1)
      expect(res.body[0].user.name).toBe('Test')
    })

    it('returns 403 for non-admin user', async () => {
      await request(app.getHttpServer())
        .get('/orders/admin')
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
    })

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/orders/admin').expect(401)
    })
  })

  describe('PATCH /orders/admin/:id/status', () => {
    it('updates order status for admin', async () => {
      const adminToken = jwtService.sign({ sub: 'admin-1', email: 'admin@test.com', role: 'admin' })

      prisma.order.findUnique.mockResolvedValue(mockOrder)
      prisma.order.update = jest.fn().mockResolvedValue({ ...mockOrder, status: 'shipped' })

      const res = await request(app.getHttpServer())
        .patch('/orders/admin/order-1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'shipped' })
        .expect(200)

      expect(res.body.status).toBe('shipped')
    })

    it('returns 403 for non-admin user', async () => {
      await request(app.getHttpServer())
        .patch('/orders/admin/order-1/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'shipped' })
        .expect(403)
    })

    it('returns 404 for missing order', async () => {
      const adminToken = jwtService.sign({ sub: 'admin-1', email: 'admin@test.com', role: 'admin' })

      prisma.order.findUnique.mockResolvedValue(null)

      await request(app.getHttpServer())
        .patch('/orders/admin/missing/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'shipped' })
        .expect(404)
    })
  })
})
