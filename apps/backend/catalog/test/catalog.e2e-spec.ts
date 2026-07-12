import { Test, type TestingModule } from '@nestjs/testing'
import { type INestApplication } from '@nestjs/common'
import request from 'supertest'
import { CatalogModule } from '../src/catalog.module'
import { PrismaService } from '../src/prisma.service'

describe('Catalog (e2e)', () => {
  let app: INestApplication
  let prisma: any

  const mockProducts = [
    {
      id: 'p1',
      name: 'Двигатель Toyota Camry',
      description: 'Двигатель',
      price: 50000,
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
    },
    {
      id: 'p2',
      name: 'Амортизатор Nissan X-Trail',
      description: 'Амортизатор',
      price: 8000,
      currency: '₽',
      images: [],
      category: 'suspension',
      brand: 'Nissan',
      modelName: 'X-Trail',
      year: 2015,
      condition: 'new',
      inStock: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
    },
  ]

  beforeAll(async () => {
    prisma = {
      product: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CatalogModule],
    })
      .overrideProvider(PrismaService).useValue(prisma)
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /products', () => {
    it('returns paginated products', async () => {
      prisma.product.findMany.mockResolvedValue(mockProducts)
      prisma.product.count.mockResolvedValue(2)

      const res = await request(app.getHttpServer())
        .get('/products')
        .expect(200)

      expect(res.body.items).toHaveLength(2)
      expect(res.body.total).toBe(2)
      expect(res.body.page).toBe(1)
      expect(res.body.totalPages).toBe(1)
    })

    it('filters by category', async () => {
      prisma.product.findMany.mockResolvedValue([mockProducts[0]])
      prisma.product.count.mockResolvedValue(1)

      const res = await request(app.getHttpServer())
        .get('/products?category=engine')
        .expect(200)

      expect(res.body.items).toHaveLength(1)
      expect(res.body.items[0].category).toBe('engine')
    })

    it('filters by condition', async () => {
      prisma.product.findMany.mockResolvedValue([mockProducts[0]])
      prisma.product.count.mockResolvedValue(1)

      await request(app.getHttpServer())
        .get('/products?condition=used')
        .expect(200)
    })

    it('searches by query', async () => {
      prisma.product.findMany.mockResolvedValue([mockProducts[0]])
      prisma.product.count.mockResolvedValue(1)

      await request(app.getHttpServer())
        .get('/products?search=camry')
        .expect(200)
    })

    it('sorts by price ascending', async () => {
      prisma.product.findMany.mockResolvedValue(mockProducts)
      prisma.product.count.mockResolvedValue(2)

      await request(app.getHttpServer())
        .get('/products?sort=price-asc')
        .expect(200)
    })

    it('handles pagination params', async () => {
      prisma.product.findMany.mockResolvedValue([])
      prisma.product.count.mockResolvedValue(50)

      const res = await request(app.getHttpServer())
        .get('/products?page=3&limit=10')
        .expect(200)

      expect(res.body.page).toBe(3)
      expect(res.body.limit).toBe(10)
    })
  })

  describe('GET /products/:id', () => {
    it('returns a product by id', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProducts[0])

      const res = await request(app.getHttpServer())
        .get('/products/p1')
        .expect(200)

      expect(res.body.name).toBe('Двигатель Toyota Camry')
    })

    it('returns 404 for missing product', async () => {
      prisma.product.findUnique.mockResolvedValue(null)

      await request(app.getHttpServer())
        .get('/products/missing')
        .expect(404)
    })
  })

  describe('GET /products/vin/:vin', () => {
    it('returns products by VIN', async () => {
      prisma.product.findMany.mockResolvedValue([mockProducts[0]])

      const res = await request(app.getHttpServer())
        .get('/products/vin/JTEAAAAAAB1234567')
        .expect(200)

      expect(res.body.products).toHaveLength(1)
      expect(res.body.products[0].brand).toBe('Toyota')
    })

    it('returns hint for unknown VIN', async () => {
      const res = await request(app.getHttpServer())
        .get('/products/vin/ZZZZZZZZZZZZZZZZZ')
        .expect(200)

      expect(res.body.products).toHaveLength(0)
      expect(res.body.hint).toBeTruthy()
    })
  })
})
