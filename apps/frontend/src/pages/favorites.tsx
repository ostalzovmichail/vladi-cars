import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { fetchFavorites, removeFavorite, type FavoriteItem } from '../lib/api'
import { useCompare } from '../lib/compare-context'
import { useToast } from '../lib/toast-context'
import { OptimizedImage } from '../components/optimized-image'
import { SEO } from '../components/seo'
import styles from './favorites.module.css'

export function FavoritesPage() {
  const { token } = useAuth()
  const { addItem: addCompare, hasItem, removeItem: removeCompare } = useCompare()
  const { addToast } = useToast()
  const [items, setItems] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    setError(null)
    fetchFavorites(token)
      .then(setItems)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => { load() }, [load])

  const handleRemove = async (productId: string) => {
    if (!token) return
    try {
      await removeFavorite(token, productId)
      setItems(prev => prev.filter(i => i.productId !== productId))
      addToast('Удалено из избранного', 'info')
    } catch {
      addToast('Ошибка при удалении', 'error')
    }
  }

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <h1 className={styles.emptyTitle}>Войдите в аккаунт</h1>
          <p className={styles.emptyText}>Чтобы просматривать избранное</p>
          <Link to="/login" className={`btn-accent ${styles.linkReset}`}>Войти</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Избранное</h1>
        <p className={styles.loadingText}>Загрузка...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Избранное</h1>
        <p className={styles.error}>{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <h1 className={styles.emptyTitle}>Избранное пусто</h1>
          <p className={styles.emptyText}>Добавляйте товары в избранное, чтобы не потерять</p>
          <Link to="/catalog" className={`btn-accent ${styles.linkReset}`}>Перейти в каталог</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <SEO title="Избранное" description={`${items.length} товаров в избранном на Владидеталь`} />
      <h1 className={styles.title}>Избранное</h1>
      <p className={styles.count}>{items.length} товаров</p>
      <div className={styles.grid}>
        {items.map(item => (
          <div key={item.id} className={styles.card}>
            <Link to={`/product/${item.productId}`} className={styles.cardLink}>
              <div className={styles.cardImage}>
                <OptimizedImage src={item.images[0]} alt={item.name} className={styles.cardImageImg} />
                {item.condition === 'new' && <span className={`badge-original ${styles.badgePos}`}>Новый</span>}
                {item.priceAtTime > 0 && item.price < item.priceAtTime && (
                  <span className={styles.priceDrop}>Цена снижена</span>
                )}
                {!item.inStock && (
                  <div className={styles.cardOutOfStock}>
                    <span>Под заказ</span>
                  </div>
                )}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>{item.brand} {item.model} ({item.year})</div>
                <h3 className={styles.cardTitle}>{item.name}</h3>
              </div>
            </Link>
            <div className={styles.cardCompare}>
              <button
                onClick={() => {
                  if (hasItem(item.productId)) {
                    removeCompare(item.productId)
                    addToast('Удалено из сравнения', 'info')
                  } else {
                    addCompare({ id: item.productId, name: item.name, price: item.price, images: item.images, category: item.category as any, brand: item.brand, model: item.model, year: item.year, condition: item.condition as any, inStock: item.inStock, description: '', currency: '₽', createdAt: '', updatedAt: '' })
                    addToast('Добавлено в сравнение', 'success')
                  }
                }}
                className={`${styles.compareBtn} ${hasItem(item.productId) ? styles.compareBtnActive : ''}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                {hasItem(item.productId) ? 'В сравнении' : 'Сравнить'}
              </button>
            </div>
            <div className={styles.cardFooter}>
              <span className={styles.cardPrice}>{item.price.toLocaleString()} ₽</span>
              <button onClick={() => handleRemove(item.productId)} className={styles.removeBtn}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
