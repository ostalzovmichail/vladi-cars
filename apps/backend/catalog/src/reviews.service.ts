import { Injectable, NotFoundException } from '@nestjs/common'
import { IsInt, Min, Max, IsString, MinLength, MaxLength } from 'class-validator'
import { PrismaService } from './prisma.service'

export interface ReviewResponse {
  id: string
  userId: string
  userName: string
  rating: number
  text: string
  createdAt: string
}

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  text!: string
}

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async getProductReviews(productId: string): Promise<ReviewResponse[]> {
    const product = await this.prisma.product.findUnique({ where: { id: productId } })
    if (!product) throw new NotFoundException('Product not found')

    const reviews = await this.prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    })

    const userIds = [...new Set(reviews.map(r => r.userId))]
    const users = userIds.length > 0
      ? await this.prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
      : []
    const userMap = new Map(users.map(u => [u.id, u.name]))

    return reviews.map(r => ({
      id: r.id,
      userId: r.userId,
      userName: userMap.get(r.userId) || 'Пользователь',
      rating: r.rating,
      text: r.text,
      createdAt: r.createdAt.toISOString(),
    }))
  }

  async create(productId: string, userId: string, dto: CreateReviewDto): Promise<ReviewResponse> {
    const product = await this.prisma.product.findUnique({ where: { id: productId } })
    if (!product) throw new NotFoundException('Product not found')

    const review = await this.prisma.review.create({
      data: {
        userId,
        productId,
        rating: dto.rating,
        text: dto.text,
      },
    })

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } })

    return {
      id: review.id,
      userId: review.userId,
      userName: user?.name || 'Пользователь',
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt.toISOString(),
    }
  }
}
