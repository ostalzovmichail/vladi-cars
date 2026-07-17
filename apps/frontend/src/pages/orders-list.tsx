import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { fetchOrders, type OrderResponse } from '../lib/api'
import { SEO } from '../components/seo'
import styles from './orders.module.css'

export function OrdersListPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    fetchOrders(token)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [token])

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <h1 className={styles.emptyTitle}>Войдите в аккаунт</h1>
          <p className={styles.emptyText}>Чтобы просматривать заказы</p>
          <Link to="/login" className={`btn-accent ${styles.linkReset}`}>Войти</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Мои заказы</h1>
        <p className={styles.loadingCenter}>Загрузка...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <h1 className={styles.emptyTitle}>У вас ещё нет заказов</h1>
          <Link to="/catalog" className={`btn-accent ${styles.linkReset}`}>Перейти в каталог</Link>
        </div>
      </div>
    )
  }

  const statusLabels: Record<string, string> = {
    pending: 'В обработке',
    confirmed: 'Подтверждён',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  }

  return (
    <div className={styles.page}>
      <SEO title="Мои заказы" description={`${orders.length} заказов на Владидеталь`} />
      <h1 className={styles.title}>Мои заказы</h1>

      {orders.map(order => (
        <Link to={`/orders/${order.id}`} key={order.id} className={styles.card}>
          <div className={styles.cardLeft}>
            <div className={styles.cardRow}>
              {order.items.length > 0 && order.items[0].image && (
                <img src={order.items[0].image} alt="" className={styles.orderThumb} />
              )}
              <div>
                <span className={styles.orderId}>Заказ №{order.id.slice(0, 8)}</span>
                <span className={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className={styles.orderCount}>{order.items.length} {order.items.length === 1 ? 'товар' : 'товаров'}</span>
              </div>
            </div>
          </div>
          <div className={styles.cardRight}>
            <div className={styles.orderTotal}>{order.total.toLocaleString()} ₽</div>
            <div className={styles.orderStatus}>{statusLabels[order.status] || order.status}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}
