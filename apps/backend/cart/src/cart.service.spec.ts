import { Test, type TestingModule } from '@nestjs/testing'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { CartService } from './cart.service'
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
  product: mockProduct,
}

const mockCart = {
  id: 'cart-1',
  userId: 'user-1',
  items: [mockCartItem],
}

describe('CartService', () => {
  let service: CartService
  let prisma: any

  beforeEach(async () => {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()

    service = module.get<CartService>(CartService)
  })

  describe('getCart', () => {
    it('returns cart with items', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart)

      const result = await service.getCart('user-1')

      expect(result.items).toHaveLength(1)
      expect(result.items[0].name).toBe('Test Part')
      expect(result.total).toBe(10000)
    })

    it('returns empty cart if none exists', async () => {
      prisma.cart.findUnique.mockResolvedValue(null)

      const result = await service.getCart('user-1')

      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })

  describe('addItem', () => {
    it('adds a new item to cart', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct)
      prisma.cart.findUnique.mockResolvedValueOnce(null)
      prisma.cart.create.mockResolvedValue(mockCart)
      prisma.cartItem.findUnique.mockResolvedValue(null)
      prisma.cartItem.create.mockResolvedValue(mockCartItem)
      prisma.cart.findUnique.mockResolvedValueOnce(mockCart)

      const result = await service.addItem('user-1', { productId: 'prod-1', quantity: 2 })

      expect(result.items).toHaveLength(1)
      expect(prisma.cartItem.create).toHaveBeenCalled()
    })

    it('increments quantity if item exists', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct)
      prisma.cart.findUnique.mockResolvedValue(mockCart)
      prisma.cartItem.findUnique.mockResolvedValue(mockCartItem)
      prisma.cart.findUnique.mockResolvedValueOnce(mockCart)

      await service.addItem('user-1', { productId: 'prod-1', quantity: 3 })

      expect(prisma.cartItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { quantity: 5 },
        }),
      )
    })

    it('throws if product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null)

      await expect(
        service.addItem('user-1', { productId: 'missing', quantity: 1 }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateQuantity', () => {
    it('updates item quantity', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart)
      prisma.cartItem.findUnique.mockResolvedValue(mockCartItem)
      prisma.cart.findUnique.mockResolvedValueOnce(mockCart)

      await service.updateQuantity('user-1', 'prod-1', { quantity: 5 })

      expect(prisma.cartItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { quantity: 5 },
        }),
      )
    })

    it('removes item if quantity is 0', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart)
      prisma.cartItem.findUnique.mockResolvedValue(mockCartItem)
      prisma.cart.findUnique.mockResolvedValueOnce(mockCart)

      await service.updateQuantity('user-1', 'prod-1', { quantity: 0 })

      expect(prisma.cartItem.delete).toHaveBeenCalled()
    })

    it('throws if quantity is negative', async () => {
      await expect(
        service.updateQuantity('user-1', 'prod-1', { quantity: -1 }),
      ).rejects.toThrow(BadRequestException)
    })

    it('throws if cart not found', async () => {
      prisma.cart.findUnique.mockResolvedValue(null)

      await expect(
        service.updateQuantity('user-1', 'prod-1', { quantity: 3 }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('removeItem', () => {
    it('removes an item from cart', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart)
      prisma.cartItem.findUnique.mockResolvedValue(mockCartItem)
      prisma.cart.findUnique.mockResolvedValueOnce(mockCart)

      await service.removeItem('user-1', 'prod-1')

      expect(prisma.cartItem.delete).toHaveBeenCalled()
    })

    it('throws if cart not found', async () => {
      prisma.cart.findUnique.mockResolvedValue(null)

      await expect(service.removeItem('user-1', 'prod-1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('clearCart', () => {
    it('deletes all cart items', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart)

      await service.clearCart('user-1')

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 'cart-1' },
      })
    })

    it('does nothing if cart does not exist', async () => {
      prisma.cart.findUnique.mockResolvedValue(null)

      await service.clearCart('user-1')

      expect(prisma.cartItem.deleteMany).not.toHaveBeenCalled()
    })
  })
})
