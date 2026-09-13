export interface OrderItemResponse {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface OrderResponse {
  id: string
  userId: string
  items: OrderItemResponse[]
  status: string
  total: number
  createdAt: string
}

export interface AdminOrderResponse extends OrderResponse {
  user: { name: string; email: string }
}

import { IsString, IsIn } from 'class-validator'

export class UpdateStatusDto {
  @IsString()
  @IsIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
  status!: string
}
