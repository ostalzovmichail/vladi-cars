import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from '../lib/toast-context'

function Tester() {
  const { addToast, toasts } = useToast()
  return (
    <div>
      <span data-testid="count">{toasts.length}</span>
      <button data-testid="add-btn" onClick={() => addToast('test', 'success')}>Add</button>
      {toasts.map(t => <div key={t.id} data-testid="toast-msg">{t.message}</div>)}
    </div>
  )
}

describe('ToastContext', () => {
  it('renders with no toasts', () => {
    render(<ToastProvider><Tester /></ToastProvider>)
    expect(screen.getByTestId('count')).toHaveTextContent('0')
    expect(screen.queryByTestId('toast-msg')).not.toBeInTheDocument()
  })

  it('adds a toast', async () => {
    const user = userEvent.setup()
    render(<ToastProvider><Tester /></ToastProvider>)
    await user.click(screen.getByTestId('add-btn'))
    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(screen.getAllByTestId('toast-msg')).toHaveLength(1)
  })

  it('adds multiple toasts', async () => {
    const user = userEvent.setup()
    render(<ToastProvider><Tester /></ToastProvider>)
    await user.click(screen.getByTestId('add-btn'))
    await user.click(screen.getByTestId('add-btn'))
    expect(screen.getByTestId('count')).toHaveTextContent('2')
    expect(screen.getAllByTestId('toast-msg')).toHaveLength(2)
  })

  it('throws when used outside ToastProvider', () => {
    function Bad() { useToast(); return null }
    expect(() => render(<Bad />)).toThrow('useToast must be used within ToastProvider')
  })
})
