import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../lib/auth-context'
import { ToastProvider } from '../lib/toast-context'
import { AdminOrdersPage } from '../pages/admin/orders'

const mockOrders = [
  {
    id: 'order-1',
    userId: 'u2',
    items: [
      { id: 'oi-1', productId: 'p1', name: 'Part A', price: 5000, quantity: 2 },
    ],
    status: 'pending',
    total: 10000,
    createdAt: '2024-01-01T00:00:00.000Z',
    user: { name: 'Customer', email: 'c@t.com' },
  },
]

function renderAdminOrders(token: string | null = 'admin-token', role: string = 'admin') {
  if (token) localStorage.setItem('vladi_token', token)
  localStorage.setItem('vladi_user', JSON.stringify({ id: 'u1', name: 'Admin', email: 'a@t.com', role }))

  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
    if (url === 'http://localhost:3000/auth/me') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'u1', name: 'Admin', email: 'a@t.com', role }) })
    }
    if (url === 'http://localhost:3000/orders/admin' && (!opts || opts.method === undefined || opts.method === 'GET')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockOrders) })
    }
    if (url === 'http://localhost:3000/orders/admin/order-1/status' && opts?.method === 'PATCH') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ ...mockOrders[0], status: 'shipped' }) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  }))

  return render(
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AdminOrdersPage />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>,
  )
}

describe('AdminOrdersPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('renders orders table for admin user', async () => {
    renderAdminOrders()
    await waitFor(() => expect(screen.getByText('Управление заказами')).toBeInTheDocument())
    expect(screen.getByText('Всего заказов: 1')).toBeInTheDocument()
  })

  it('shows access denied for non-admin user', async () => {
    renderAdminOrders('mock-token', 'customer')
    await waitFor(() => expect(screen.getByText('Доступ запрещён')).toBeInTheDocument())
    expect(screen.getByText('На главную')).toBeInTheDocument()
  })

  it('displays order details', async () => {
    renderAdminOrders()
    await waitFor(() => expect(screen.getByText('Customer')).toBeInTheDocument())
    expect(screen.getByText('c@t.com')).toBeInTheDocument()
    expect(screen.getByText(/10[,\s]?000/)).toBeInTheDocument()
  })

  it('has status select dropdown', async () => {
    renderAdminOrders()
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox')
      expect(selects.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('changes status via dropdown', async () => {
    renderAdminOrders()
    await waitFor(() => expect(screen.getByText('Customer')).toBeInTheDocument())

    const user = userEvent.setup()
    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 'shipped')

    await waitFor(() => {
      expect(screen.getByText('В обработке')).toBeInTheDocument()
    })
  })
})
