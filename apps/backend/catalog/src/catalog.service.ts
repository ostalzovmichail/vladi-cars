import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import type { Product } from '@vladi-cars/shared-types'
import { PrismaService } from './prisma.service'
import { CatalogQueryDto, PaginatedResponse } from './dto/query.dto'
import { CreateProductDto, UpdateProductDto } from './dto/product.dto'
import { lookupVin } from './vin-lookup'
import sharp from 'sharp'
import { mkdir, writeFile } from 'fs/promises'
import { resolve } from 'path'
import { randomUUID } from 'crypto'
import { existsSync } from 'fs'

function toProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    currency: p.currency,
    images: p.images.length > 0 ? p.images : [`https://picsum.photos/seed/${p.id}/400/300`],
    category: p.category,
    brand: p.brand,
    model: p.modelName,
    year: p.year,
    condition: p.condition as 'new' | 'used',
    inStock: p.inStock,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }
}

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: CatalogQueryDto): Promise<PaginatedResponse<Product>> {
    const page = Math.max(1, query.page || 1)
    const limit = Math.min(100, Math.max(1, query.limit || 20))
    const skip = (page - 1) * limit

    const where: any = {}

    if (query.search) {
      const q = query.search.toLowerCase()
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { modelName: { contains: q, mode: 'insensitive' } },
      ]
    }

    if (query.category) where.category = query.category
    if (query.condition) where.condition = query.condition
    if (query.brand) {
      const brands = query.brand.split(',').map(b => b.trim()).filter(Boolean)
      if (brands.length === 1) {
        where.brand = brands[0]
      } else {
        where.brand = { in: brands }
      }
    }
    if (query.minPrice || query.maxPrice) {
      where.price = {}
      if (query.minPrice) where.price.gte = query.minPrice
      if (query.maxPrice) where.price.lte = query.maxPrice
    }

    if (query.minYear || query.maxYear) {
      where.year = {}
      if (query.minYear) where.year.gte = query.minYear
      if (query.maxYear) where.year.lte = query.maxYear
    }

    if (query.model) {
      where.modelName = { contains: query.model, mode: 'insensitive' }
    }

    let orderBy: any = { name: 'asc' }
    if (query.sort === 'price-asc') orderBy = { price: 'asc' }
    else if (query.sort === 'price-desc') orderBy = { price: 'desc' }
    else if (query.sort === 'name') orderBy = { name: 'asc' }
    else if (query.sort === 'date') orderBy = { createdAt: 'desc' }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({ where, orderBy, skip, take: limit }),
      this.prisma.product.count({ where }),
    ])

    return {
      items: items.map(toProduct),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if (!product) throw new NotFoundException('Product not found')
    return toProduct(product)
  }

  async findByVin(vin: string): Promise<{ products: Product[]; hint: string | null }> {
    const result: { products: Product[]; hint: string | null } = { products: [], hint: null }
    if (!vin || vin.length < 3) {
      result.hint = 'VIN должен содержать минимум 3 символа'
      return result
    }

    const { brand, hint } = lookupVin(vin)
    result.hint = hint

    if (!brand) return result

    result.products = (await this.prisma.product.findMany({
      where: { brand },
      take: 20,
    })).map(toProduct)

    return result
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const existing = await this.prisma.product.findFirst({
      where: { name: dto.name, brand: dto.brand },
    })
    if (existing) {
      throw new BadRequestException('Product with this name and brand already exists')
    }
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description || '',
        price: dto.price,
        currency: dto.currency || '₽',
        images: dto.images || [],
        category: dto.category,
        brand: dto.brand,
        modelName: dto.modelName || '',
        year: dto.year || 0,
        condition: dto.condition || 'used',
        inStock: dto.inStock ?? true,
      },
    })
    return toProduct(product)
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const existing = await this.prisma.product.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Product not found')
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.images !== undefined && { images: dto.images }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.brand !== undefined && { brand: dto.brand }),
        ...(dto.modelName !== undefined && { modelName: dto.modelName }),
        ...(dto.year !== undefined && { year: dto.year }),
        ...(dto.condition !== undefined && { condition: dto.condition }),
        ...(dto.inStock !== undefined && { inStock: dto.inStock }),
      },
    })
    return toProduct(product)
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.product.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Product not found')
    await this.prisma.product.delete({ where: { id } })
  }

  async uploadImage(id: string, file: Express.Multer.File): Promise<{ url: string; thumbnailUrl: string; images: string[] }> {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if (!product) throw new NotFoundException('Product not found')

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed')
    }

    const filename = randomUUID() + '.webp'
    const thumbFilename = 'thumb_' + filename
    const dir = resolve(process.cwd(), 'uploads', id)

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }

    const main = await sharp(file.buffer)
      .resize(800, undefined, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()
    await writeFile(resolve(dir, filename), main)

    const thumb = await sharp(file.buffer)
      .resize(200, undefined, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 60 })
      .toBuffer()
    await writeFile(resolve(dir, thumbFilename), thumb)

    const url = `/uploads/${id}/${filename}`
    const thumbnailUrl = `/uploads/${id}/${thumbFilename}`
    const images = [...(product.images || []), url]

    await this.prisma.product.update({
      where: { id },
      data: { images },
    })

    return { url, thumbnailUrl, images }
  }

  async getModels(brand?: string): Promise<string[]> {
    const where: any = {}
    if (brand) where.brand = brand
    const result = await this.prisma.product.findMany({
      select: { modelName: true },
      distinct: ['modelName'],
      where,
      orderBy: { modelName: 'asc' },
    })
    return result.map(r => r.modelName).filter(Boolean)
  }

  async getBrands(): Promise<string[]> {
    const result = await this.prisma.product.findMany({
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    })
    return result.map(r => r.brand)
  }
}
