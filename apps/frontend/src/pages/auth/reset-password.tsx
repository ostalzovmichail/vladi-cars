import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { API_BASE } from '../../lib/api'
import { SEO } from '../../components/seo'
import styles from './login.module.css'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Пароль изменён!')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setMessage(data.message || 'Ошибка')
      }
    } catch {
      setMessage('Ошибка при сбросе пароля')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className={styles.page}>
        <SEO title="Сброс пароля" description="Недействительная ссылка для сброса пароля" />
        <div className={styles.card}>
          <h1 className={styles.title}>Неверная ссылка</h1>
          <p className={styles.subtitle}>Отсутствует токен сброса пароля</p>
          <p className={styles.footer}><Link to="/forgot-password">Запросить сброс</Link></p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <SEO title="Новый пароль" description="Установите новый пароль для аккаунта Владидеталь" />
      <div className={styles.card}>
        <h1 className={styles.title}>Новый пароль</h1>
        <p className={styles.subtitle}>Введите новый пароль</p>

        {message && <div className={styles.success}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Новый пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={styles.input} placeholder="Минимум 6 символов" required minLength={6} disabled={loading} />
          </div>
          <button type="submit" className={`btn-accent ${styles.submit}`} disabled={loading || !password}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  )
}
