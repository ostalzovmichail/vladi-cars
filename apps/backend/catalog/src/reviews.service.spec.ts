import { Test, type TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { ReviewsService } from './reviews.service'
import { PrismaService } from './prisma.service'

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

describe('ReviewsService', () => {
  let service: ReviewsService
  let prisma: any

  beforeEach(async () => {
    prisma = {
      product: {
        findUnique: jest.fn(),
      },
      review: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()

    service = module.get<ReviewsService>(ReviewsService)
  })

  describe('getProductReviews', () => {
    it('returns reviews for a product', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct)
      prisma.review.findMany.mockResolvedValue([mockReview])
      prisma.user.findMany.mockResolvedValue([{ id: 'user-1', name: 'Test User' }])

      const result = await service.getProductReviews('prod-1')

      expect(result).toHaveLength(1)
      expect(result[0].rating).toBe(5)
      expect(result[0].text).toBe('Great part!')
      expect(result[0].userName).toBe('Test User')
    })

    it('throws if product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null)

      await expect(service.getProductReviews('missing')).rejects.toThrow(NotFoundException)
    })

    it('returns empty array if no reviews', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct)
      prisma.review.findMany.mockResolvedValue([])

      const result = await service.getProductReviews('prod-1')

      expect(result).toHaveLength(0)
    })
  })

  describe('create', () => {
    it('creates a review', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct)
      prisma.review.create.mockResolvedValue(mockReview)
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', name: 'Test User' })

      const result = await service.create('prod-1', 'user-1', { rating: 5, text: 'Great part!' })

      expect(result.rating).toBe(5)
      expect(result.text).toBe('Great part!')
      expect(prisma.review.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          productId: 'prod-1',
          rating: 5,
          text: 'Great part!',
        },
      })
    })

    it('throws if product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null)

      await expect(
        service.create('missing', 'user-1', { rating: 5, text: 'Nice' }),
      ).rejects.toThrow(NotFoundException)
    })
  })
})
