import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import './http'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const AUTH_API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function storeToken(token: string | null) {
  if (token) localStorage.setItem('vladi_token', token)
  else localStorage.removeItem('vladi_token')
}

function getToken(): string | null {
  return localStorage.getItem('vladi_token')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: getToken(), loading: true })

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setState(s => ({ ...s, loading: false }))
      return
    }
    fetch(`${AUTH_API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('invalid')
        return res.json()
      })
      .then(user => setState({ user: { ...user, role: user.role || 'customer' }, token, loading: false }))
      .catch(() => {
        storeToken(null)
        setState({ user: null, token: null, loading: false })
      })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${AUTH_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Login failed')
    }
    const data = await res.json()
    storeToken(data.token)
    setState({ user: data.user, token: data.token, loading: false })
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    const res = await fetch(`${AUTH_API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Registration failed')
    }
    const data = await res.json()
    storeToken(data.token)
    setState({ user: data.user, token: data.token, loading: false })
  }, [])

  const logout = useCallback(() => {
    storeToken(null)
    setState({ user: null, token: null, loading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
