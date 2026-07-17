import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Product } from '@vladi-cars/shared-types'
import { fetchProduct, fetchReviews, createReview, type ReviewItem } from '../lib/api'
import { useCart } from '../lib/cart-context'
import { useAuth } from '../lib/auth-context'
import { useToast } from '../lib/toast-context'
import { OptimizedImage } from '../components/optimized-image'
import { SEO } from '../components/seo'
import styles from './product.module.css'

const categoryLabels: Record<string, string> = {
  engine: 'Двигатель', transmission: 'Трансмиссия', suspension: 'Подвеска',
  brakes: 'Тормозная система', body: 'Кузовные детали', optics: 'Оптика',
  electronics: 'Электроника', interior: 'Салон', exhaust: 'Выхлопная система',
  cooling: 'Система охлаждения',
}

function StarIcon({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#f59e0b' : 'none'} stroke={filled ? '#f59e0b' : 'rgba(0,0,0,0.15)'} strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const { addItem } = useCart()
  const { token } = useAuth()
  const { addToast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    fetchProduct(id)
      .then(setProduct)
      .catch(e => setError(e instanceof Error ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    setReviewsLoading(true)
    fetchReviews(id)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setReviewsLoading(false))
  }, [id])

  const handleSubmitReview = async () => {
    if (!id || !token || !reviewText.trim()) return
    setSubmitting(true)
    try {
      const review = await createReview(token, id, reviewRating, reviewText.trim())
      setReviews(prev => [review, ...prev])
      setReviewText('')
      setReviewRating(5)
      addToast('Отзыв добавлен', 'success')
    } catch {
      addToast('Ошибка при добавлении отзыва', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (loading) {
    return (
      <div className={styles.notFound}>
        <h1>Загрузка...</h1>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className={styles.notFound}>
        <h1>Товар не найден</h1>
        <p>{error}</p>
        <Link to="/catalog" className={styles.backLink}>← Вернуться в каталог</Link>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <SEO
        title={product ? `${product.brand} ${product.model} (${product.year}) — ${product.name}` : 'Товар'}
        description={product?.description}
        ogImage={product?.images[0]}
      />
      <Link to="/catalog" className={styles.backLink}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Назад в каталог
      </Link>

      <div className={styles.layout}>
        <div>
          <div className={styles.imageBox}>
            <OptimizedImage src={product.images[selectedImage] || product.images[0]} alt={product.name} className={styles.imageBoxImg} />
          </div>
          {product.images.length > 1 && (
            <div className={styles.thumbnails}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`${styles.thumbBtn} ${i === selectedImage ? styles.thumbActive : ''}`}
                >
                  <OptimizedImage src={img} alt="" className={styles.thumbImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className={styles.meta}>Арт. {product.id}</div>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.subtitle}>{product.brand} {product.model} ({product.year})</p>

          <div className={styles.priceRow}>
            <span className={styles.price}>{product.price.toLocaleString()} ₽</span>
            {product.condition === 'used' && <span className={styles.oldPrice}>{(product.price * 1.3).toFixed(0)} ₽</span>}
            <span className={product.condition === 'new' ? 'badge-original' : 'badge-sale'}>
              {product.condition === 'new' ? 'Новый' : 'Контракт'}
            </span>
          </div>

          <div className={styles.actions}>
            <button onClick={() => addItem(product.id)} disabled={!product.inStock} className={`btn-accent ${styles.addToCartBtn}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.cartSvg}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              {product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}
            </button>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Описание</h2>
            <p className={styles.sectionText}>{product.description}</p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Характеристики</h2>
            <dl className={styles.specs}>
              <dt className={styles.specLabel}>Категория</dt>
              <dd className={styles.specValue}>{categoryLabels[product.category]}</dd>
              <dt className={styles.specLabel}>Бренд</dt>
              <dd className={styles.specValue}>{product.brand}</dd>
              <dt className={styles.specLabel}>Модель</dt>
              <dd className={styles.specValue}>{product.model}</dd>
              <dt className={styles.specLabel}>Год</dt>
              <dd className={styles.specValue}>{product.year}</dd>
              <dt className={styles.specLabel}>Состояние</dt>
              <dd className={styles.specValue}>{product.condition === 'new' ? 'Новая' : 'Б/у (контрактная)'}</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className={styles.reviewsSection}>
        <h2 className={styles.sectionTitle}>Отзывы {avgRating && <span className={styles.reviewsAvg}>· {avgRating}</span>}</h2>

        {token && (
          <div className={styles.reviewForm}>
            <div className={styles.reviewStarsInput}>
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setReviewRating(s)} className={styles.starBtn}>
                  <StarIcon filled={s <= reviewRating} size={20} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Напишите отзыв..."
              className={styles.reviewTextarea}
              rows={3}
            />
            <button onClick={handleSubmitReview} disabled={submitting || !reviewText.trim()} className={`btn-accent ${styles.submitReviewBtn}`}>
              {submitting ? 'Отправка...' : 'Оставить отзыв'}
            </button>
          </div>
        )}

        {reviewsLoading && <p className={styles.reviewsStatus}>Загрузка отзывов...</p>}
        {!reviewsLoading && reviews.length === 0 && !token && (
          <p className={styles.reviewsStatus}>Нет отзывов. <Link to="/login">Войдите</Link>, чтобы оставить отзыв.</p>
        )}
        {!reviewsLoading && reviews.length === 0 && token && (
          <p className={styles.reviewsStatus}>Будьте первым, кто оставит отзыв!</p>
        )}

        <div className={styles.reviewsList}>
          {reviews.map(r => (
            <div key={r.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewStars}>
                  {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= r.rating} size={12} />)}
                </div>
                <span className={styles.reviewDate}>
                  {new Date(r.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <p className={styles.reviewText}>{r.text}</p>
              <span className={styles.reviewAuthor}>{r.userName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
