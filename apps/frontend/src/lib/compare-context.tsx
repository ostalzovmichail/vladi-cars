import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Product } from '@vladi-cars/shared-types'
import { useToast } from './toast-context'

interface CompareContextValue {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  clearAll: () => void
  hasItem: (productId: string) => boolean
}

const CompareContext = createContext<CompareContextValue | null>(null)

const MAX_COMPARE = 4

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const { addToast } = useToast()

  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      if (prev.find(p => p.id === product.id)) return prev
      if (prev.length >= MAX_COMPARE) {
        addToast(`Максимум ${MAX_COMPARE} товара для сравнения`, 'info')
        return prev
      }
      return [...prev, product]
    })
  }, [addToast])

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(p => p.id !== productId))
  }, [])

  const clearAll = useCallback(() => {
    setItems([])
  }, [])

  const hasItem = useCallback((productId: string) => {
    return items.some(p => p.id === productId)
  }, [items])

  return (
    <CompareContext.Provider value={{ items, addItem, removeItem, clearAll, hasItem }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within CompareProvider')
  return ctx
}
