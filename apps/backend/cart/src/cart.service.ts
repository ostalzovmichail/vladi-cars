import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { AddItemDto, UpdateQuantityDto, CartItemResponse, CartResponse } from './dto/cart.dto'

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string): Promise<CartResponse> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    })

    if (!cart) {
      return { id: '', userId, items: [], total: 0 }
    }

    const items: CartItemResponse[] = cart.items.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      inStock: item.product.inStock,
    }))

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return { id: cart.id, userId: cart.userId, items, total }
  }

  async addItem(userId: string, dto: AddItemDto): Promise<CartResponse> {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } })
    if (!product) throw new NotFoundException('Product not found')
    if (!product.inStock) throw new BadRequestException('Product is out of stock')

    let cart = await this.prisma.cart.findUnique({ where: { userId } })
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } })
    }

    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: dto.productId } },
    })

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (dto.quantity ?? 1) },
      })
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity ?? 1,
        },
      })
    }

    return this.getCart(userId)
  }

  async updateQuantity(userId: string, productId: string, dto: UpdateQuantityDto): Promise<CartResponse> {
    if (dto.quantity < 0) throw new BadRequestException('Quantity must be >= 0')

    const cart = await this.prisma.cart.findUnique({ where: { userId } })
    if (!cart) throw new NotFoundException('Cart not found')

    const item = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    })
    if (!item) throw new NotFoundException('Item not in cart')

    if (dto.quantity === 0) {
      await this.prisma.cartItem.delete({ where: { id: item.id } })
    } else {
      await this.prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: dto.quantity },
      })
    }

    return this.getCart(userId)
  }

  async removeItem(userId: string, productId: string): Promise<CartResponse> {
    const cart = await this.prisma.cart.findUnique({ where: { userId } })
    if (!cart) throw new NotFoundException('Cart not found')

    const item = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    })
    if (!item) throw new NotFoundException('Item not in cart')

    await this.prisma.cartItem.delete({ where: { id: item.id } })

    return this.getCart(userId)
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.prisma.cart.findUnique({ where: { userId } })
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    }
  }
}
