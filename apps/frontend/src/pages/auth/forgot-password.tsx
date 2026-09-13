import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../../lib/api'
import { SEO } from '../../components/seo'
import styles from './login.module.css'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setToken('')
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      setMessage(data.message || 'Проверьте email')
      if (data.token) setToken(data.token)
    } catch {
      setMessage('Ошибка при отправке')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <SEO title="Восстановление пароля" description="Восстановите доступ к аккаунту Владидеталь" />
      <div className={styles.card}>
        <h1 className={styles.title}>Восстановление пароля</h1>
        <p className={styles.subtitle}>Введите email, привязанный к аккаунту</p>

        {message && <div className={styles.success}>{message}</div>}
        {token && (
          <div className={styles.devBox}>
            Dev mode: <Link to={`/reset-password?token=${token}`} className={styles.devLink}>Сбросить пароль</Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={styles.input} placeholder="your@email.com" required disabled={loading} />
          </div>
          <button type="submit" className={`btn-accent ${styles.submit}`} disabled={loading}>
            {loading ? 'Отправка...' : 'Сбросить пароль'}
          </button>
        </form>

        <p className={styles.footer}>
          <Link to="/login">Вернуться ко входу</Link>
        </p>
      </div>
    </div>
  )
}
