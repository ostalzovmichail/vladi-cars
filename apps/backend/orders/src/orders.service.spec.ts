import { Test, type TestingModule } from '@nestjs/testing'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { PrismaService } from './prisma.service'

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

describe('OrdersService', () => {
  let service: OrdersService
  let prisma: any

  beforeEach(async () => {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()

    service = module.get<OrdersService>(OrdersService)
  })

  describe('createFromCart', () => {
    it('creates order from cart items', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart)
      prisma.product.findMany.mockResolvedValue([mockProduct])
      prisma.order.create.mockResolvedValue(mockOrder)

      const result = await service.createFromCart('user-1')

      expect(result.id).toBe('order-1')
      expect(result.items).toHaveLength(1)
      expect(result.total).toBe(10000)
      expect(prisma.cartItem.deleteMany).toHaveBeenCalled()
    })

    it('throws if cart is empty', async () => {
      prisma.cart.findUnique.mockResolvedValue({ ...mockCart, items: [] })

      await expect(service.createFromCart('user-1')).rejects.toThrow(BadRequestException)
    })

    it('throws if cart does not exist', async () => {
      prisma.cart.findUnique.mockResolvedValue(null)

      await expect(service.createFromCart('user-1')).rejects.toThrow(BadRequestException)
    })

    it('throws if product out of stock', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart)
      prisma.product.findMany.mockResolvedValue([{ ...mockProduct, inStock: false }])

      await expect(service.createFromCart('user-1')).rejects.toThrow(BadRequestException)
    })
  })

  describe('getUserOrders', () => {
    it('returns user orders', async () => {
      prisma.order.findMany.mockResolvedValue([mockOrder])

      const result = await service.getUserOrders('user-1')

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('order-1')
    })

    it('returns empty array if no orders', async () => {
      prisma.order.findMany.mockResolvedValue([])

      const result = await service.getUserOrders('user-1')

      expect(result).toHaveLength(0)
    })
  })

  describe('getOrder', () => {
    it('returns order by id', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder)

      const result = await service.getOrder('user-1', 'order-1')

      expect(result.id).toBe('order-1')
      expect(result.status).toBe('pending')
    })

    it('throws if order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null)

      await expect(service.getOrder('user-1', 'missing')).rejects.toThrow(NotFoundException)
    })

    it('throws if order belongs to different user', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder)

      await expect(service.getOrder('other-user', 'order-1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('findAll (admin)', () => {
    it('returns all orders with user info', async () => {
      const mockAdminOrder = {
        ...mockOrder,
        user: { name: 'Test', email: 'test@test.com' },
      }
      prisma.order.findMany.mockResolvedValue([mockAdminOrder])

      const result = await service.findAll()

      expect(result).toHaveLength(1)
      expect(result[0].user.name).toBe('Test')
      expect(result[0].user.email).toBe('test@test.com')
    })

    it('returns empty array if no orders', async () => {
      prisma.order.findMany.mockResolvedValue([])

      const result = await service.findAll()

      expect(result).toHaveLength(0)
    })
  })

  describe('updateStatus', () => {
    it('updates order status', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder)
      prisma.order.update.mockResolvedValue({ ...mockOrder, status: 'shipped' })

      const result = await service.updateStatus('order-1', 'shipped')

      expect(result.status).toBe('shipped')
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'shipped' },
        include: { items: true },
      })
    })

    it('throws if order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null)

      await expect(service.updateStatus('missing', 'shipped')).rejects.toThrow(NotFoundException)
    })
  })
})
