import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from './prisma.service'

export interface FavoriteResponse {
  id: string
  productId: string
  name: string
  price: number
  priceAtTime: number
  images: string[]
  category: string
  brand: string
  model: string
  year: number
  condition: string
  inStock: boolean
}

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string): Promise<FavoriteResponse[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    })
    return favorites.map(f => ({
      id: f.id,
      productId: f.product.id,
      name: f.product.name,
      price: f.product.price,
      priceAtTime: f.priceAtTime,
      images: f.product.images,
      category: f.product.category,
      brand: f.product.brand,
      model: f.product.modelName,
      year: f.product.year,
      condition: f.product.condition,
      inStock: f.product.inStock,
    }))
  }

  async add(userId: string, productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({ where: { id: productId } })
    if (!product) throw new NotFoundException('Product not found')
    await this.prisma.favorite.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId, priceAtTime: product.price },
      update: {},
    })
  }

  async remove(userId: string, productId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({ where: { userId, productId } })
  }
}
