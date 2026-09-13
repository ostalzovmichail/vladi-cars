import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Product } from '@vladi-cars/shared-types'
import { useAuth } from '../../lib/auth-context'
import { fetchProducts, deleteProduct } from '../../lib/api'
import { useToast } from '../../lib/toast-context'
import { SEO } from '../../components/seo'
import styles from './products.module.css'

export function AdminProductsPage() {
  const { token, user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    setError(null)
    fetchProducts({ limit: 200 })
      .then(res => setProducts(res.items))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    if (!token) return
    if (!window.confirm('Удалить товар?')) return
    setDeleting(id)
    try {
      await deleteProduct(token, id)
      setProducts(prev => prev.filter(p => p.id !== id))
      addToast('Товар удалён', 'success')
    } catch {
      addToast('Ошибка при удалении', 'error')
    } finally {
      setDeleting(null)
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
        <h1 className={styles.title}>Управление товарами</h1>
        <p className={styles.loadingText}>Загрузка...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Управление товарами</h1>
        <p className={styles.error}>{error}</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <SEO title="Админ — Товары" description="Управление товарами Владидеталь" />
      <div className={styles.header}>
        <h1 className={styles.title}>Управление товарами</h1>
        <Link to="/admin/products/new" className={`btn-accent ${styles.addBtn}`}>
          + Добавить товар
        </Link>
      </div>
      <p className={styles.count}>Всего товаров: {products.length}</p>

      {products.length === 0 ? (
        <p className={styles.empty}>Нет товаров</p>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span className={styles.colName}>Название</span>
            <span className={styles.colBrand}>Бренд</span>
            <span className={styles.colCategory}>Категория</span>
            <span className={styles.colPrice}>Цена</span>
            <span className={styles.colStock}>Наличие</span>
            <span className={styles.colActions}>Действия</span>
          </div>
          {products.map(p => (
            <div key={p.id} className={styles.tableRow}>
              <span className={styles.colName}>
                <Link to={`/product/${p.id}`} className={styles.productLink}>{p.name}</Link>
              </span>
              <span className={styles.colBrand}>{p.brand}</span>
              <span className={styles.colCategory}>{p.category}</span>
              <span className={styles.colPrice}>{p.price.toLocaleString()} ₽</span>
              <span className={styles.colStock}>
                <span className={`${styles.statusBadge} ${p.inStock ? styles.inStock : styles.outOfStock}`}>
                  {p.inStock ? 'В наличии' : 'Под заказ'}
                </span>
              </span>
              <span className={styles.colActions}>
                <button onClick={() => navigate(`/admin/products/${p.id}/edit`)} className={styles.actionBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                </button>
                <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className={`${styles.actionBtn} ${styles.deleteBtn}`}>
                  {deleting === p.id ? '...' : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>}
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
