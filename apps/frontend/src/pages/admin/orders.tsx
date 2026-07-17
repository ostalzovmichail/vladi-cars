import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'
import { fetchAllOrders, updateOrderStatus, type AdminOrderResponse } from '../../lib/api'
import { useToast } from '../../lib/toast-context'
import { SEO } from '../../components/seo'
import styles from './orders.module.css'

const statusLabels: Record<string, string> = {
  pending: 'В обработке',
  confirmed: 'Подтверждён',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export function AdminOrdersPage() {
  const { token, user } = useAuth()
  const { addToast } = useToast()
  const [orders, setOrders] = useState<AdminOrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    setError(null)
    fetchAllOrders(token)
      .then(setOrders)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!token) return
    setUpdating(orderId)
    try {
      await updateOrderStatus(token, orderId, newStatus)
      addToast(`Статус изменён на "${statusLabels[newStatus] || newStatus}"`, 'success')
      load()
    } catch {
      addToast('Ошибка при изменении статуса', 'error')
    } finally {
      setUpdating(null)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <h1 className={styles.emptyTitle}>Доступ запрещён</h1>
          <p className={styles.emptyText}>Только для администраторов</p>
          <Link to="/" className={`btn-accent ${styles.linkReset}`}>На главную</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Управление заказами</h1>
        <p className={styles.loadingText}>Загрузка...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Управление заказами</h1>
        <p className={styles.error}>{error}</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Управление заказами</h1>
        <p className={styles.empty}>Нет заказов</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <SEO title="Админ — Заказы" description="Управление заказами Владидеталь" />
      <h1 className={styles.title}>Управление заказами</h1>
      <p className={styles.count}>Всего заказов: {orders.length}</p>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span className={styles.colId}>Заказ</span>
          <span className={styles.colUser}>Клиент</span>
          <span className={styles.colDate}>Дата</span>
          <span className={styles.colTotal}>Сумма</span>
          <span className={styles.colStatus}>Статус</span>
          <span className={styles.colActions}>Действия</span>
        </div>
        {orders.map(order => (
          <div key={order.id} className={styles.tableRow}>
            <span className={styles.colId}>#{order.id.slice(0, 8)}</span>
            <span className={styles.colUser}>
              <div>{order.user.name}</div>
              <div className={styles.userEmail}>{order.user.email}</div>
            </span>
            <span className={styles.colDate}>
              {new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className={styles.colTotal}>{order.total.toLocaleString()} ₽</span>
            <span className={styles.colStatus}>
              <span className={`${styles.statusBadge} ${styles[`status_${order.status}`] || ''}`}>
                {statusLabels[order.status] || order.status}
              </span>
            </span>
            <span className={styles.colActions}>
              <select
                value=""
                onChange={e => { if (e.target.value) handleStatusChange(order.id, e.target.value) }}
                disabled={updating === order.id}
                className={styles.statusSelect}
              >
                <option value="">{updating === order.id ? '...' : 'Сменить'}</option>
                {statuses.filter(s => s !== order.status).map(s => (
                  <option key={s} value={s}>{statusLabels[s] || s}</option>
                ))}
              </select>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
