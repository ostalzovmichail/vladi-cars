import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../lib/auth-context'
import { CartProvider } from '../lib/cart-context'
import { ToastProvider } from '../lib/toast-context'
import { ProductPage } from '../pages/product'

const mockProduct = {
  id: 'prod-1',
  name: 'Test Part',
  description: 'A great part',
  price: 5000,
  currency: '₽',
  images: ['https://picsum.photos/seed/prod-1/400/300'],
  category: 'engine',
  brand: 'Toyota',
  model: 'Camry',
  year: 2010,
  condition: 'used',
  inStock: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const mockReviews = [
  { id: 'rev-1', userId: 'u2', userName: 'Пользователь', rating: 5, text: 'Great part!', createdAt: '2024-02-01T00:00:00.000Z' },
]

function renderProduct(token: string | null = 'mock-token', reviews: any[] = mockReviews) {
  if (token) localStorage.setItem('vladi_token', token)
  localStorage.setItem('vladi_user', JSON.stringify({ id: 'u1', name: 'Test', email: 't@t.com', role: 'customer' }))

  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
    if (url === 'http://localhost:3000/auth/me') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'u1', name: 'Test', email: 't@t.com', role: 'customer' }) })
    }
    if (url === 'http://localhost:3000/products/prod-1') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockProduct) })
    }
    if (url === 'http://localhost:3000/products/prod-1/reviews' && (!opts || opts.method === undefined || opts.method === 'GET')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(reviews) })
    }
    if (url === 'http://localhost:3000/products/prod-1/reviews' && opts?.method === 'POST') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'rev-2', userId: 'u1', userName: 'Пользователь', rating: 4, text: 'Nice!', createdAt: new Date().toISOString() }) })
    }
    if (url === 'http://localhost:3000/cart') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'c1', userId: 'u1', items: [], total: 0 }) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  }))

  return render(
    <MemoryRouter initialEntries={['/product/prod-1']}>
      <Routes>
        <Route path="/product/:id" element={
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <ProductPage />
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        } />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProductPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('renders product details', async () => {
    renderProduct()
    await waitFor(() => expect(screen.getByText('Test Part')).toBeInTheDocument())
    expect(screen.getByText('Toyota Camry (2010)')).toBeInTheDocument()
    expect(screen.getByText(/5[,\s]?000/)).toBeInTheDocument()
  })

  it('renders reviews', async () => {
    renderProduct()
    await waitFor(() => expect(screen.getByText('Great part!')).toBeInTheDocument())
  })

  it('shows average rating', async () => {
    renderProduct()
    await waitFor(() => expect(screen.getByText(/5\.0/)).toBeInTheDocument())
  })

  it('submits a new review', async () => {
    const user = userEvent.setup()
    renderProduct()

    await waitFor(() => expect(screen.getByText('Test Part')).toBeInTheDocument())

    const textarea = screen.getByPlaceholderText('Напишите отзыв...')
    await user.type(textarea, 'Nice!')

    const submitBtn = screen.getByText('Оставить отзыв')
    await user.click(submitBtn)
  })
})
