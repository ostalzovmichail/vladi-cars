import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../lib/auth-context'
import { CartProvider } from '../lib/cart-context'
import { ToastProvider } from '../lib/toast-context'
import { CartPage } from '../pages/cart'

const mockCartItems = [
  { id: 'ci-1', productId: 'p1', name: 'Part A', price: 5000, quantity: 2, inStock: true },
]

function renderCart(token: string | null = 'mock-token') {
  if (token) localStorage.setItem('vladi_token', token)

  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
    if (url === 'http://localhost:3000/auth/me') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'u1', name: 'Test', email: 't@t.com' }) })
    }
    if (url === 'http://localhost:3000/cart' && (!opts || opts.method === undefined || opts.method === 'GET')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'cart-1', userId: 'u1', items: mockCartItems, total: 10000 }) })
    }
    if (url === 'http://localhost:3000/orders' && opts?.method === 'POST') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'order-1', status: 'pending', total: 10000, items: mockCartItems, userId: 'u1', createdAt: '2024-01-01' }) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  }))

  return render(
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <CartPage />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>,
  )
}

describe('CartPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('shows cart with items', async () => {
    renderCart()
    await waitFor(() => expect(screen.getByText('Part A')).toBeInTheDocument())
    const prices = screen.getAllByText(/10[,.\s]?000/)
    expect(prices.length).toBe(2)
    expect(screen.queryByText('Корзина пуста')).not.toBeInTheDocument()
  })

  it('shows empty cart state', async () => {
    renderCart(null)
    await waitFor(() => expect(screen.getByText('Корзина пуста')).toBeInTheDocument())
    expect(screen.getByText('Перейти в каталог')).toBeInTheDocument()
  })

  it('shows quantity controls', async () => {
    renderCart()
    await waitFor(() => expect(screen.getByText('Part A')).toBeInTheDocument())
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('−')).toBeInTheDocument()
    expect(screen.getByText('+')).toBeInTheDocument()
  })

  it('renders checkout button', async () => {
    renderCart()
    await waitFor(() => expect(screen.getByText('Оформить заказ')).toBeInTheDocument())
  })
})
