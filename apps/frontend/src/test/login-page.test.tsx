import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../lib/auth-context'
import { LoginPage } from '../pages/auth/login'

function mockFetchResolved(data: unknown) {
  return Promise.resolve(data)
}

function renderPage() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResolved({ ok: true, json: () => Promise.resolve({ id: '1', name: 'Test', email: 't@t.com' }) })))
  })

  it('renders login form', () => {
    renderPage()
    expect(screen.getByText('Вход')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
  })

  it('shows link to register page', () => {
    renderPage()
    expect(screen.getByText('Зарегистрироваться')).toBeInTheDocument()
  })

  it('submits form and navigates on success', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(mockFetchResolved({ ok: true, json: () => Promise.resolve({ id: '1', name: 'Test', email: 't@t.com' }) }))
      .mockResolvedValueOnce(mockFetchResolved({ ok: true, json: () => Promise.resolve({ token: 't', user: { id: '1', name: 'Test', email: 't@t.com' } }) }))
    vi.stubGlobal('fetch', fetchMock)

    renderPage()
    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@test.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    await waitFor(() => {
      expect(window.location.pathname).toBe('/')
    })
  })

  it('shows error on failed login', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResolved({
      ok: false,
      json: () => Promise.resolve({ message: 'Неверный email или пароль' }),
    })))

    renderPage()
    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@test.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    await waitFor(() => {
      expect(screen.getByText('Неверный email или пароль')).toBeInTheDocument()
    })
  })
})
