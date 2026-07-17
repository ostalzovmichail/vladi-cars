export interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  images: string[]
  category: ProductCategory
  brand: string
  model: string
  year: number
  condition: 'new' | 'used'
  inStock: boolean
  createdAt: string
  updatedAt: string
}

export type ProductCategory =
  | 'engine'
  | 'transmission'
  | 'suspension'
  | 'brakes'
  | 'body'
  | 'optics'
  | 'electronics'
  | 'interior'
  | 'exhaust'
  | 'cooling'

export interface CartItem {
  productId: string
  quantity: number
}

export interface Cart {
  id: string
  items: CartItem[]
  total: number
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  status: OrderStatus
  total: number
  createdAt: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface User {
  id: string
  email: string
  name: string
}
