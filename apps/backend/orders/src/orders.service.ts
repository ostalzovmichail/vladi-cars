import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { OrderItemResponse, OrderResponse, AdminOrderResponse } from './dto/order.dto'

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createFromCart(userId: string): Promise<OrderResponse> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    })

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty')
    }

    const productIds = cart.items.map(i => i.productId)
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    })
    const productMap = new Map(products.map(p => [p.id, p]))

    for (const item of cart.items) {
      const product = productMap.get(item.productId)
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`)
      if (!product.inStock) throw new BadRequestException(`Product ${product.name} is out of stock`)
    }

    const orderItems = cart.items.map(item => {
      const product = productMap.get(item.productId)!
      return {
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || '',
      }
    })

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        items: { create: orderItems },
      },
      include: { items: true },
    })

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

    return this.toResponse(order)
  }

  async getUserOrders(userId: string): Promise<OrderResponse[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    return orders.map(o => this.toResponse(o))
  }

  async findAll(): Promise<AdminOrderResponse[]> {
    const orders = await this.prisma.order.findMany({
      include: { items: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return orders.map(o => ({
      ...this.toResponse(o),
      user: o.user,
    }))
  }

  async updateStatus(orderId: string, status: string): Promise<OrderResponse> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { items: true } })
    if (!order) throw new NotFoundException('Order not found')
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    })
    return this.toResponse(updated)
  }

  async getOrder(userId: string, orderId: string): Promise<OrderResponse> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })
    if (!order) throw new NotFoundException('Order not found')
    if (order.userId !== userId) throw new NotFoundException('Order not found')
    return this.toResponse(order)
  }

  private toResponse(order: any): OrderResponse {
    return {
      id: order.id,
      userId: order.userId,
      items: order.items.map((i: any): OrderItemResponse => ({
        id: i.id,
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image || '',
      })),
      status: order.status,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
    }
  }
}
