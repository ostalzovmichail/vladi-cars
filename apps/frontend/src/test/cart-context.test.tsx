import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartProvider, useCart } from '../lib/cart-context'
import { AuthProvider } from '../lib/auth-context'

const mockItems = [
  { id: 'ci-1', productId: 'p1', name: 'Part A', price: 5000, quantity: 2, inStock: true },
  { id: 'ci-2', productId: 'p2', name: 'Part B', price: 3000, quantity: 1, inStock: true },
]

const mockCartResponse = { id: 'cart-1', userId: 'u1', items: mockItems, total: 13000 }

function createFetchMock() {
  return vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
    if (url === 'http://localhost:3000/auth/me') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'u1', name: 'Test', email: 't@t.com' }) })
    }
    if (url === 'http://localhost:3000/cart' && (!opts || opts.method === 'GET' || opts.method === undefined)) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCartResponse) })
    }
    if (url === 'http://localhost:3000/cart/items' && opts?.method === 'POST') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ ...mockCartResponse, items: [...mockItems, { id: 'ci-3', productId: 'p3', name: 'Part C', price: 2000, quantity: 1, inStock: true }] }) })
    }
    if ((url as string)?.startsWith('http://localhost:3000/cart/items/') && opts?.method === 'DELETE') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ ...mockCartResponse, items: mockItems.filter(i => i.productId !== 'p1') }) })
    }
    if ((url as string)?.startsWith('http://localhost:3000/cart/items/') && opts?.method === 'PATCH') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ ...mockCartResponse, items: mockItems.map(i => i.productId === 'p1' ? { ...i, quantity: 5 } : i) }) })
    }
    if (url === 'http://localhost:3000/cart' && opts?.method === 'DELETE') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  })
}

function renderWithProviders(ui: React.ReactElement, token: string | null = 'mock-token') {
  if (token) localStorage.setItem('vladi_token', token)
  vi.stubGlobal('fetch', createFetchMock())

  return render(
    <AuthProvider>
      <CartProvider>{ui}</CartProvider>
    </AuthProvider>,
  )
}

function TestConsumer() {
  const { items, addItem, removeItem, updateQuantity, clearCart, total } = useCart()
  return (
    <div>
      <span data-testid="count">{items.length}</span>
      <span data-testid="total">{total}</span>
      <ul data-testid="items">
        {items.map(i => <li key={i.productId} data-testid={`item-${i.productId}`}>{i.name} x{i.quantity}</li>)}
      </ul>
      <button data-testid="add-btn" onClick={() => addItem('p3')}>Add</button>
      <button data-testid="remove-btn" onClick={() => removeItem('p1')}>Remove</button>
      <button data-testid="update-btn" onClick={() => updateQuantity('p1', 5)}>Update</button>
      <button data-testid="clear-btn" onClick={() => clearCart()}>Clear</button>
    </div>
  )
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('loads cart from API on mount with token', async () => {
    renderWithProviders(<TestConsumer />)
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'))
    expect(screen.getByTestId('items')).toHaveTextContent('Part A x2')
    expect(screen.getByTestId('items')).toHaveTextContent('Part B x1')
    expect(screen.getByTestId('total')).toHaveTextContent('13000')
  })

  it('addItem calls API and updates items', async () => {
    renderWithProviders(<TestConsumer />)
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'))
    await userEvent.click(screen.getByTestId('add-btn'))
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('3'))
  })

  it('removeItem calls API and updates items', async () => {
    renderWithProviders(<TestConsumer />)
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'))
    await userEvent.click(screen.getByTestId('remove-btn'))
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'))
  })

  it('updateQuantity calls API and updates items', async () => {
    renderWithProviders(<TestConsumer />)
    await waitFor(() => expect(screen.getByTestId('items')).toHaveTextContent('Part A x2'))
    await userEvent.click(screen.getByTestId('update-btn'))
    await waitFor(() => expect(screen.getByTestId('items')).toHaveTextContent('Part A x5'))
  })

  it('clearCart empties items', async () => {
    renderWithProviders(<TestConsumer />)
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'))
    await userEvent.click(screen.getByTestId('clear-btn'))
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('0'))
    expect(screen.getByTestId('total')).toHaveTextContent('0')
  })
})

describe('useCart', () => {
  it('throws when used outside CartProvider', () => {
    function Bad() { useCart(); return null }
    expect(() => render(<Bad />)).toThrow('useCart must be used within CartProvider')
  })
})
