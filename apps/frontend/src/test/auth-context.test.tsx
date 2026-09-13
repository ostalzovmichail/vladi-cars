import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../lib/auth-context'

const mockUser = { id: '1', name: 'Test', email: 'test@test.com' }
const mockToken = 'mock-jwt-token'

function mockFetch(data: unknown) {
  return vi.fn().mockResolvedValue(data)
}

function renderWithProvider(ui: React.ReactElement, initialToken: string | null = null) {
  if (initialToken) localStorage.setItem('vladi_token', initialToken)
  return render(<AuthProvider>{ui}</AuthProvider>)
}

function TestConsumer() {
  const ctx = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="token">{ctx.token || 'null'}</span>
      <span data-testid="user">{ctx.user ? ctx.user.email : 'null'}</span>
      <button data-testid="login-btn" onClick={() => ctx.login('a@b.com', 'pass').catch(() => {})}>Login</button>
      <button data-testid="register-btn" onClick={() => ctx.register('Name', 'a@b.com', 'pass').catch(() => {})}>Register</button>
      <button data-testid="logout-btn" onClick={() => ctx.logout()}>Logout</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('resolves loading and has no user without token', async () => {
    renderWithProvider(<TestConsumer />)
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('user')).toHaveTextContent('null')
    expect(screen.getByTestId('token')).toHaveTextContent('null')
  })

  it('rehydrates session from stored token', async () => {
    vi.stubGlobal('fetch', mockFetch({ ok: true, json: () => Promise.resolve(mockUser) }))

    renderWithProvider(<TestConsumer />, mockToken)

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('token')).toHaveTextContent(mockToken)
    expect(screen.getByTestId('user')).toHaveTextContent('test@test.com')
  })

  it('clears token if /auth/me fails', async () => {
    vi.stubGlobal('fetch', mockFetch({ ok: false }))

    renderWithProvider(<TestConsumer />, 'invalid-token')

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('token')).toHaveTextContent('null')
    expect(localStorage.getItem('vladi_token')).toBeNull()
  })

  it('login stores token and sets user', async () => {
    vi.stubGlobal('fetch', mockFetch({
      ok: true,
      json: () => Promise.resolve({ token: mockToken, user: mockUser }),
    }))

    renderWithProvider(<TestConsumer />)
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    await userEvent.click(screen.getByTestId('login-btn'))

    await waitFor(() => expect(screen.getByTestId('token')).toHaveTextContent(mockToken))
    expect(screen.getByTestId('user')).toHaveTextContent('test@test.com')
    expect(localStorage.getItem('vladi_token')).toBe(mockToken)
  })

  it('handles login error gracefully', async () => {
    vi.stubGlobal('fetch', mockFetch({
      ok: false,
      json: () => Promise.resolve({ message: 'Invalid credentials' }),
    }))

    renderWithProvider(<TestConsumer />)
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))

    await userEvent.click(screen.getByTestId('login-btn'))
    await waitFor(() => expect(screen.getByTestId('token')).toHaveTextContent('null'))
  })

  it('register stores token and sets user', async () => {
    vi.stubGlobal('fetch', mockFetch({
      ok: true,
      json: () => Promise.resolve({ token: mockToken, user: mockUser }),
    }))

    renderWithProvider(<TestConsumer />)
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    await userEvent.click(screen.getByTestId('register-btn'))

    await waitFor(() => expect(screen.getByTestId('token')).toHaveTextContent(mockToken))
    expect(screen.getByTestId('user')).toHaveTextContent('test@test.com')
  })

  it('logout clears user and token', async () => {
    vi.stubGlobal('fetch', mockFetch({ ok: true, json: () => Promise.resolve(mockUser) }))

    renderWithProvider(<TestConsumer />, mockToken)
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('token')).toHaveTextContent(mockToken)

    await userEvent.click(screen.getByTestId('logout-btn'))

    expect(screen.getByTestId('token')).toHaveTextContent('null')
    expect(screen.getByTestId('user')).toHaveTextContent('null')
    expect(localStorage.getItem('vladi_token')).toBeNull()
  })
})

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within AuthProvider')
  })
})
