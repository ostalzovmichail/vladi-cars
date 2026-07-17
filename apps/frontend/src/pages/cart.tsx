import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../lib/cart-context'
import { useAuth } from '../lib/auth-context'
import { useToast } from '../lib/toast-context'
import { createOrder } from '../lib/api'
import { SEO } from '../components/seo'
import styles from './cart.module.css'

export function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart()
  const { token } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [ordering, setOrdering] = useState(false)

  const handleCheckout = async () => {
    if (!token) {
      navigate('/login')
      return
    }
    setOrdering(true)
    try {
      const order = await createOrder(token)
      navigate(`/orders/${order.id}`, { state: { order } })
    } catch {
      addToast('Ошибка при оформлении заказа', 'error')
    } finally {
      setOrdering(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <SEO title="Корзина" description="Ваша корзина покупок на Владидеталь" />
        <h1 className={styles.emptyTitle}>Корзина пуста</h1>
        <p className={styles.emptyText}>Добавьте запчасти из каталога</p>
        <Link to="/catalog" className="btn-accent">Перейти в каталог</Link>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <SEO title="Корзина" description={`Корзина: ${items.length} товаров на сумму ${total.toLocaleString()} ₽`} />
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Корзина</h1>
        <button className={`btn-outline ${styles.clearBtn}`} onClick={clearCart}>Очистить</button>
      </div>

      <div className={styles.items}>
        {items.map(item => (
          <div key={item.productId} className={styles.item}>
            <div className={styles.itemImage}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </div>
            <div className={styles.itemInfo}>
              <Link to={`/product/${item.productId}`} className={styles.itemName}>
                {item.name}
              </Link>
              <p className={styles.itemPrice}>{item.price.toLocaleString()} ₽</p>
            </div>
            <div className={styles.quantity}>
              <button onClick={() => item.quantity > 1 && updateQuantity(item.productId, item.quantity - 1)} className={styles.qtyBtn} disabled={item.quantity <= 1}>−</button>
              <span className={styles.qtyValue}>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className={styles.qtyBtn}>+</button>
            </div>
            <span className={styles.subtotal}>{(item.price * item.quantity).toLocaleString()} ₽</span>
            <button onClick={() => removeItem(item.productId)} className={styles.removeBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <p className={styles.total}>
          Итого: <span className={styles.totalAmount}>{total.toLocaleString()} ₽</span>
        </p>
        <button className={`btn-accent ${styles.checkoutBtn}`} onClick={handleCheckout} disabled={ordering}>
          {ordering ? 'Оформляем...' : 'Оформить заказ'}
        </button>
      </div>
    </div>
  )
}
