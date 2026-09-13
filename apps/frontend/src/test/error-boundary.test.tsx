import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '../components/error-boundary'

function Bomb(): React.ReactNode {
  throw new Error('💥')
}

function Good() {
  return <div data-testid="good">All good</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <Good />
      </ErrorBoundary>,
    )
    expect(screen.getByTestId('good')).toHaveTextContent('All good')
  })

  it('catches error and shows fallback UI', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument()
    expect(screen.getByText('💥')).toBeInTheDocument()
  })

  it('resets error state on retry click', async () => {
    const user = userEvent.setup()
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument()
    await user.click(screen.getByText('Попробовать снова'))
    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument()
  })

  it('shows default error message when no error message', () => {
    function EmptyError(): React.ReactNode { throw new Error() }
    render(
      <ErrorBoundary>
        <EmptyError />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Произошла непредвиденная ошибка')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    const fallback = <div data-testid="custom">Custom error</div>
    render(
      <ErrorBoundary fallback={fallback}>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByTestId('custom')).toHaveTextContent('Custom error')
  })
})
