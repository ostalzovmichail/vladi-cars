import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react'
import { useAuth } from './auth-context'
import { fetchCart, addCartItem, updateCartItemQuantity, removeCartItem, clearCartApi, type CartItemResponse } from './api'

interface CartState {
  items: CartItemResponse[]
  synced: boolean
}

type CartAction =
  | { type: 'SET_ITEMS'; items: CartItemResponse[] }
  | { type: 'SET_SYNCED'; synced: boolean }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.items, synced: true }
    case 'SET_SYNCED':
      return { ...state, synced: action.synced }
    default:
      return state
  }
}

interface CartContextValue {
  items: CartItemResponse[]
  addItem: (productId: string, quantity?: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  total: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [state, dispatch] = useReducer(cartReducer, { items: [], synced: false })

  useEffect(() => {
    if (token) {
      fetchCart(token)
        .then(res => dispatch({ type: 'SET_ITEMS', items: res.items }))
        .catch(() => dispatch({ type: 'SET_ITEMS', items: [] }))
    } else {
      dispatch({ type: 'SET_ITEMS', items: [] })
    }
  }, [token])

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    if (token) {
      const res = await addCartItem(token, productId, quantity)
      dispatch({ type: 'SET_ITEMS', items: res.items })
    }
  }, [token])

  const removeItem = useCallback(async (productId: string) => {
    if (token) {
      const res = await removeCartItem(token, productId)
      dispatch({ type: 'SET_ITEMS', items: res.items })
    }
  }, [token])

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (token) {
      const res = await updateCartItemQuantity(token, productId, quantity)
      dispatch({ type: 'SET_ITEMS', items: res.items })
    }
  }, [token])

  const clearCart = useCallback(async () => {
    if (token) {
      await clearCartApi(token)
      dispatch({ type: 'SET_ITEMS', items: [] })
    }
  }, [token])

  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items: state.items, addItem, removeItem, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
