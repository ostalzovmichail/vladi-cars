import { IsString, IsInt, Min, IsOptional } from 'class-validator'

export class AddItemDto {
  @IsString()
  productId!: string

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number
}

export class UpdateQuantityDto {
  @IsInt()
  @Min(0)
  quantity!: number
}

export interface CartItemResponse {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  inStock: boolean
}

export interface CartResponse {
  id: string
  userId: string
  items: CartItemResponse[]
  total: number
}
