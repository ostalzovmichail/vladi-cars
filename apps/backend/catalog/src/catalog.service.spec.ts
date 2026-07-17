import { Test, type TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { CatalogService } from './catalog.service'
import { PrismaService } from './prisma.service'

const mockProduct = {
  id: 'test-1',
  name: 'Test Part',
  description: 'A test part',
  price: 10000,
  currency: '₽',
  images: [],
  category: 'engine',
  brand: 'Toyota',
  modelName: 'Camry',
  year: 2010,
  condition: 'used',
  inStock: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('CatalogService', () => {
  let service: CatalogService
  let prisma: any

  beforeEach(async () => {
    prisma = {
      product: {
        findMany: jest.fn().mockResolvedValue([mockProduct]),
        count: jest.fn().mockResolvedValue(1),
        findUnique: jest.fn().mockResolvedValue(mockProduct),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()

    service = module.get<CatalogService>(CatalogService)
  })

  describe('findAll', () => {
    it('returns paginated products', async () => {
      const result = await service.findAll({})

      expect(result.items).toHaveLength(1)
      expect(result.items[0].name).toBe('Test Part')
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.totalPages).toBe(1)
    })

    it('passes correct where clause for search', async () => {
      await service.findAll({ search: 'camry' })

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: 'camry', mode: 'insensitive' } },
              { brand: { contains: 'camry', mode: 'insensitive' } },
              { modelName: { contains: 'camry', mode: 'insensitive' } },
            ],
          },
        }),
      )
    })

    it('applies category filter', async () => {
      await service.findAll({ category: 'engine' })

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'engine' }),
        }),
      )
    })

    it('applies condition filter', async () => {
      await service.findAll({ condition: 'new' })

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ condition: 'new' }),
        }),
      )
    })

    it('applies sort by price ascending', async () => {
      await service.findAll({ sort: 'price-asc' })

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { price: 'asc' } }),
      )
    })

    it('applies sort by price descending', async () => {
      await service.findAll({ sort: 'price-desc' })

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { price: 'desc' } }),
      )
    })

    it('handles pagination', async () => {
      await service.findAll({ page: 3, limit: 10 })

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      )
    })

    it('caps limit at 100', async () => {
      await service.findAll({ limit: 999 })

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      )
    })

    it('transforms modelName to model in response', async () => {
      const result = await service.findAll({})

      expect(result.items[0]).toHaveProperty('model', 'Camry')
    })
  })

  describe('findOne', () => {
    it('returns a product by id', async () => {
      const result = await service.findOne('test-1')

      expect(result.name).toBe('Test Part')
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-1' },
      })
    })

    it('throws NotFoundException when product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null)

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException)
    })
  })
})
