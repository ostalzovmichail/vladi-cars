import { Test, type TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { FavoritesService } from './favorites.service'
import { PrismaService } from './prisma.service'

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

describe('FavoritesService', () => {
  let service: FavoritesService
  let prisma: any

  beforeEach(async () => {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()

    service = module.get<FavoritesService>(FavoritesService)
  })

  describe('findAll', () => {
    it('returns favorites with product info', async () => {
      prisma.favorite.findMany.mockResolvedValue([mockFavorite])

      const result = await service.findAll('user-1')

      expect(result).toHaveLength(1)
      expect(result[0].productId).toBe('prod-1')
      expect(result[0].name).toBe('Test Part')
      expect(result[0].brand).toBe('Toyota')
    })

    it('returns empty array if no favorites', async () => {
      prisma.favorite.findMany.mockResolvedValue([])

      const result = await service.findAll('user-1')

      expect(result).toHaveLength(0)
    })
  })

  describe('add', () => {
    it('adds a product to favorites', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct)
      prisma.favorite.upsert.mockResolvedValue(mockFavorite)

      await service.add('user-1', 'prod-1')

      expect(prisma.favorite.upsert).toHaveBeenCalledWith({
        where: { userId_productId: { userId: 'user-1', productId: 'prod-1' } },
        create: { userId: 'user-1', productId: 'prod-1', priceAtTime: 5000 },
        update: {},
      })
    })

    it('throws if product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null)

      await expect(service.add('user-1', 'missing')).rejects.toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it('removes a product from favorites', async () => {
      await service.remove('user-1', 'prod-1')

      expect(prisma.favorite.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', productId: 'prod-1' },
      })
    })
  })
})
