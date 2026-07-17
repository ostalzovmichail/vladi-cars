import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'
import { SEO } from '../../components/seo'
import styles from './login.module.css'

const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (phone && !phoneRegex.test(phone)) {
      setError('Неверный формат телефона')
      return
    }
    setLoading(true)
    try {
      await register(name, email, password, phone || undefined)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <SEO title="Регистрация" description="Создайте аккаунт на Владидеталь для отслеживания заказов и избранного" />
      <div className={styles.card}>
        <h1 className={styles.title}>Регистрация</h1>
        <p className={styles.subtitle}>Создайте аккаунт для заказов</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Имя</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={styles.input} placeholder="Иван Иванов" required disabled={loading} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={styles.input} placeholder="your@email.com" required disabled={loading} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Телефон</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={styles.input} placeholder="+7 (999) 123-45-67" pattern="^\+?[0-9\s\-()]{7,20}$" disabled={loading} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={styles.input} placeholder="Минимум 6 символов" required minLength={6} disabled={loading} />
          </div>
          <button type="submit" className={`btn-accent ${styles.submit}`} disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className={styles.footer}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  )
}
