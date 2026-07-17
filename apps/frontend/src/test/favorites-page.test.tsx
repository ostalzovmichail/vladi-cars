import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../lib/auth-context'
import { ToastProvider } from '../lib/toast-context'
import { FavoritesPage } from '../pages/favorites'

const mockFavorites = [
  {
    id: 'fav-1',
    productId: 'prod-1',
    name: 'Test Part',
    price: 5000,
    images: ['https://picsum.photos/seed/prod-1/400/300'],
    category: 'engine',
    brand: 'Toyota',
    model: 'Camry',
    year: 2010,
    condition: 'used',
    inStock: true,
  },
]

function renderFavorites(token: string | null = 'mock-token') {
  if (token) localStorage.setItem('vladi_token', token)
  localStorage.setItem('vladi_user', JSON.stringify({ id: 'u1', name: 'Test', email: 't@t.com', role: 'customer' }))

  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
    if (url === 'http://localhost:3000/auth/me') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'u1', name: 'Test', email: 't@t.com', role: 'customer' }) })
    }
    if (url === 'http://localhost:3000/favorites' && (!opts || opts.method === undefined || opts.method === 'GET')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockFavorites) })
    }
    if (url === 'http://localhost:3000/favorites/prod-1' && opts?.method === 'DELETE') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  }))

  return render(
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <FavoritesPage />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>,
  )
}

describe('FavoritesPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('shows favorites list', async () => {
    renderFavorites()
    await waitFor(() => expect(screen.getByText('Test Part')).toBeInTheDocument())
    expect(screen.getByText('1 товаров')).toBeInTheDocument()
  })

  it('shows empty state when no favorites', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url === 'http://localhost:3000/auth/me') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'u1', name: 'Test', email: 't@t.com', role: 'customer' }) })
      }
      if (url === 'http://localhost:3000/favorites') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    }))
    localStorage.setItem('vladi_token', 'mock-token')
    localStorage.setItem('vladi_user', JSON.stringify({ id: 'u1', name: 'Test', email: 't@t.com', role: 'customer' }))

    render(
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <FavoritesPage />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>,
    )
    await waitFor(() => expect(screen.getByText('Избранное пусто')).toBeInTheDocument())
    expect(screen.getByText('Перейти в каталог')).toBeInTheDocument()
  })

  it('shows login prompt when not authenticated', async () => {
    renderFavorites(null)
    await waitFor(() => expect(screen.getByText('Войдите в аккаунт')).toBeInTheDocument())
    expect(screen.getByText('Войти')).toBeInTheDocument()
  })

  it('removes a favorite on delete click', async () => {
    renderFavorites()
    await waitFor(() => expect(screen.getByText('Test Part')).toBeInTheDocument())

    const user = userEvent.setup()
    await user.click(screen.getByText('Удалить'))

    await waitFor(() => expect(screen.getByText('Избранное пусто')).toBeInTheDocument())
  })
})
