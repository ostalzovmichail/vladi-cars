import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { updateProfile, changePassword } from '../lib/api'
import { useToast } from '../lib/toast-context'
import { SEO } from '../components/seo'

const s: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 600,
    margin: '0 auto',
  },
  title: {
    fontFamily: 'Oswald, sans-serif',
    fontSize: 30,
    fontWeight: 700,
    textTransform: 'uppercase',
    margin: '0 0 24px',
  },
  section: {
    background: 'white',
    border: '1px solid rgba(0,0,0,0.10)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Oswald, sans-serif',
    fontSize: 16,
    fontWeight: 600,
    textTransform: 'uppercase',
    margin: '0 0 16px',
    color: '#1a1a1e',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 12,
    color: '#7a7a82',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: 14,
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: 10,
    outline: 'none',
    background: 'white',
    color: '#1a1a1e',
    boxSizing: 'border-box',
  },
  disabledInput: {
    background: '#f5f5f5',
    color: '#7a7a82',
  },
  btn: {
    padding: '10px 24px',
    fontFamily: 'Oswald, sans-serif',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 600,
    borderRadius: 999,
    border: 'none',
    background: '#c8191a',
    color: 'white',
    cursor: 'pointer',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  error: {
    color: '#c8191a',
    fontSize: 12,
    marginTop: 6,
  },
  success: {
    color: '#1a7d42',
    fontSize: 12,
    marginTop: 6,
  },
  divider: {
    height: 1,
    background: 'rgba(0,0,0,0.08)',
    margin: '24px 0',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 0',
  },
  emptyTitle: {
    fontFamily: 'Oswald, sans-serif',
    fontSize: 24,
    fontWeight: 700,
    margin: '0 0 8px',
    color: '#1a1a1e',
  },
  emptyText: {
    fontSize: 14,
    color: '#7a7a82',
    margin: '0 0 24px',
  },
}

export function ProfilePage() {
  const { user, token, login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [changing, setChanging] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  if (!token) {
    return (
      <div style={s.page}>
        <div style={s.empty}>
          <h1 style={s.emptyTitle}>Войдите в аккаунт</h1>
          <p style={s.emptyText}>Чтобы просматривать профиль</p>
          <Link to="/login" className="btn-accent" style={{ textDecoration: 'none' }}>Войти</Link>
        </div>
      </div>
    )
  }

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setSaving(true)
    try {
      const updated = await updateProfile(token, { name, phone: phone || undefined })
      setProfileSuccess('Профиль обновлён')
      addToast('Профиль обновлён', 'success')
    } catch (err: any) {
      setProfileError(err.message || 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')
    if (newPassword.length < 6) {
      setPasswordError('Пароль должен быть минимум 6 символов')
      return
    }
    setChanging(true)
    try {
      const res = await changePassword(token, oldPassword, newPassword)
      setPasswordSuccess(res.message)
      setOldPassword('')
      setNewPassword('')
      addToast(res.message, 'success')
    } catch (err: any) {
      setPasswordError(err.message || 'Ошибка')
    } finally {
      setChanging(false)
    }
  }

  return (
    <div style={s.page}>
      <SEO title="Профиль" description="Настройки профиля на Владидеталь" />
      <h1 style={s.title}>Профиль</h1>

      <form onSubmit={handleProfile} style={s.section}>
        <h2 style={s.sectionTitle}>Личные данные</h2>
        <div style={s.field}>
          <label style={s.label}>Email</label>
          <input type="email" value={user?.email || ''} disabled style={{ ...s.input, ...s.disabledInput }} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Имя</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            style={s.input}
            placeholder="Ваше имя"
          />
        </div>
        <div style={s.field}>
          <label style={s.label}>Телефон</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={s.input}
            placeholder="+7 (___) ___-__-__"
          />
        </div>
        {profileError && <p style={s.error}>{profileError}</p>}
        {profileSuccess && <p style={s.success}>{profileSuccess}</p>}
        <button type="submit" disabled={saving} style={{ ...s.btn, ...(saving ? s.btnDisabled : {}) }}>
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>

      <form onSubmit={handlePassword} style={s.section}>
        <h2 style={s.sectionTitle}>Смена пароля</h2>
        <div style={s.field}>
          <label style={s.label}>Текущий пароль</label>
          <input
            type="password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            style={s.input}
            required
          />
        </div>
        <div style={s.field}>
          <label style={s.label}>Новый пароль</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            style={s.input}
            required
            minLength={6}
          />
        </div>
        {passwordError && <p style={s.error}>{passwordError}</p>}
        {passwordSuccess && <p style={s.success}>{passwordSuccess}</p>}
        <button type="submit" disabled={changing} style={{ ...s.btn, ...(changing ? s.btnDisabled : {}) }}>
          {changing ? 'Смена...' : 'Изменить пароль'}
        </button>
      </form>
    </div>
  )
}
