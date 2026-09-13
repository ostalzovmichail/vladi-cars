import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { fetchOrder, type OrderResponse } from '../lib/api'
import { SEO } from '../components/seo'
import styles from './orders.module.css'

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuth()
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !token) return
    fetchOrder(token, id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [id, token])

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loadingLg}>Загрузка...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <h1 className={styles.emptyTitle}>Заказ не найден</h1>
          <Link to="/orders" className={`btn-accent ${styles.linkReset}`}>Мои заказы</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <SEO title={`Заказ №${order.id.slice(0, 8)}`} description={`Заказ на сумму ${order.total.toLocaleString()} ₽, статус: ${order.status}`} />
      <Link to="/orders" className={styles.backLink}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Все заказы
      </Link>

      <div className={styles.meta}>Заказ №{order.id.slice(0, 8)}</div>
      <h1 className={`${styles.title} ${styles.titleMb}`}>Заказ оформлен</h1>
      <span className={styles.statusBadge}>{order.status === 'pending' ? 'В обработке' : order.status}</span>
      <p className={styles.totalLarge}>{order.total.toLocaleString()} ₽</p>
      <p className={`${styles.meta} ${styles.metaMt}`}>{new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Состав заказа</h2>
        {order.items.map(item => (
          <div key={item.id} className={styles.orderItem}>
            <div className={styles.orderItemLeft}>
              {item.image && (
                <img src={item.image} alt={item.name} className={styles.orderItemThumb} />
              )}
              <div>
                <Link to={`/product/${item.productId}`} className={styles.orderItemLink}>
                  {item.name}
                </Link>
                <p className={styles.orderItemQty}>{item.quantity} шт. × {item.price.toLocaleString()} ₽</p>
              </div>
            </div>
            <span className={styles.orderItemPrice}>{(item.price * item.quantity).toLocaleString()} ₽</span>
          </div>
        ))}
      </div>

      <Link to="/catalog" className={`btn-accent ${styles.continueBtn}`}>
        Продолжить покупки
      </Link>
    </div>
  )
}
