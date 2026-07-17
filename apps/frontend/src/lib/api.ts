import type { Product } from '@vladi-cars/shared-types'

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

interface PaginatedResponse {
  items: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/* ─── Catalog ─── */

export async function fetchProducts(params: {
  search?: string
  category?: string
  condition?: string
  brand?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  minYear?: number
  maxYear?: number
  sort?: string
  page?: number
  limit?: number
} = {}): Promise<PaginatedResponse> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.category) query.set('category', params.category)
  if (params.condition) query.set('condition', params.condition)
  if (params.brand) query.set('brand', params.brand)
  if (params.model) query.set('model', params.model)
  if (params.minPrice) query.set('minPrice', String(params.minPrice))
  if (params.maxPrice) query.set('maxPrice', String(params.maxPrice))
  if (params.minYear) query.set('minYear', String(params.minYear))
  if (params.maxYear) query.set('maxYear', String(params.maxYear))
  if (params.sort) query.set('sort', params.sort)
  if (params.page) query.set('page', String(params.page))
  query.set('limit', String(params.limit ?? 12))

  const res = await fetch(`${API_BASE}/products?${query}`)
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`)
  return res.json()
}

export async function fetchBrands(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/products/brands`)
  if (!res.ok) throw new Error('Failed to fetch brands')
  return res.json()
}

export async function fetchModels(brand?: string): Promise<string[]> {
  const query = brand ? `?brand=${encodeURIComponent(brand)}` : ''
  const res = await fetch(`${API_BASE}/products/models${query}`)
  if (!res.ok) throw new Error('Failed to fetch models')
  return res.json()
}

export async function fetchVinProducts(vin: string): Promise<{ products: Product[]; hint: string | null }> {
  const res = await fetch(`${API_BASE}/products/vin/${encodeURIComponent(vin)}`)
  if (!res.ok) throw new Error('Failed to search by VIN')
  return res.json()
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch product: ${res.statusText}`)
  return res.json()
}

/* ─── Cart ─── */

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

export async function fetchCart(token: string): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/cart`, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error('Failed to fetch cart')
  return res.json()
}

export async function addCartItem(token: string, productId: string, quantity = 1): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/cart/items`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ productId, quantity }),
  })
  if (!res.ok) throw new Error('Failed to add item')
  return res.json()
}

export async function updateCartItemQuantity(token: string, productId: string, quantity: number): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/cart/items/${productId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ quantity }),
  })
  if (!res.ok) throw new Error('Failed to update quantity')
  return res.json()
}

export async function removeCartItem(token: string, productId: string): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/cart/items/${productId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error('Failed to remove item')
  return res.json()
}

export async function clearCartApi(token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/cart`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error('Failed to clear cart')
}

/* ─── Auth ─── */

interface SafeUser {
  id: string; name: string; email: string; phone?: string; role: string
}

export async function updateProfile(token: string, data: { name?: string; phone?: string }): Promise<SafeUser> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update profile')
  return res.json()
}

export async function changePassword(token: string, oldPassword: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ oldPassword, newPassword }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to change password')
  }
  return res.json()
}

/* ─── Orders ─── */

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

export async function createOrder(token: string): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error('Failed to create order')
  return res.json()
}

export async function fetchOrders(token: string): Promise<OrderResponse[]> {
  const res = await fetch(`${API_BASE}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch orders')
  return res.json()
}

export async function fetchOrder(token: string, id: string): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch order')
  return res.json()
}

/* ─── Favorites ─── */

export interface FavoriteItem {
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

export async function fetchFavorites(token: string): Promise<FavoriteItem[]> {
  const res = await fetch(`${API_BASE}/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch favorites')
  return res.json()
}

export async function addFavorite(token: string, productId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ productId }),
  })
  if (!res.ok) throw new Error('Failed to add favorite')
}

export async function removeFavorite(token: string, productId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/favorites/${productId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to remove favorite')
}

/* ─── Reviews ─── */

export interface ReviewItem {
  id: string
  userId: string
  userName: string
  rating: number
  text: string
  createdAt: string
}

export async function fetchReviews(productId: string): Promise<ReviewItem[]> {
  const res = await fetch(`${API_BASE}/products/${productId}/reviews`)
  if (!res.ok) throw new Error('Failed to fetch reviews')
  return res.json()
}

export async function createReview(token: string, productId: string, rating: number, text: string): Promise<ReviewItem> {
  const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rating, text }),
  })
  if (!res.ok) throw new Error('Failed to create review')
  return res.json()
}

/* ─── Admin ─── */

export interface AdminOrderResponse extends OrderResponse {
  user: { name: string; email: string }
}

export async function fetchAllOrders(token: string): Promise<AdminOrderResponse[]> {
  const res = await fetch(`${API_BASE}/orders/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch orders')
  return res.json()
}

export async function updateOrderStatus(token: string, orderId: string, status: string): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE}/orders/admin/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to update status')
  return res.json()
}

/* ─── Admin Products ─── */

export async function createProduct(token: string, data: Record<string, any>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create product')
  return res.json()
}

export async function updateProduct(token: string, id: string, data: Record<string, any>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update product')
  return res.json()
}

export async function deleteProduct(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to delete product')
}

/* ─── Admin Image Upload ─── */

export async function uploadProductImage(
  token: string,
  productId: string,
  file: File,
): Promise<{ url: string; thumbnailUrl: string; images: string[] }> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE}/products/${productId}/images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  if (!res.ok) throw new Error('Failed to upload image')
  return res.json()
}
