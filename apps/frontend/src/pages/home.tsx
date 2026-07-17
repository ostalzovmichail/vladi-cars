import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '@vladi-cars/shared-types'
import { fetchProducts } from '../lib/api'
import { useCart } from '../lib/cart-context'
import { OptimizedImage } from '../components/optimized-image'
import { SEO } from '../components/seo'
import styles from './home.module.css'

const categories = [
  { name: 'Toyota / Lexus', count: 4820, emoji: '🇯🇵' },
  { name: 'Nissan / Infiniti', count: 3610, emoji: '🇯🇵' },
  { name: 'Honda / Acura', count: 2990, emoji: '🇯🇵' },
  { name: 'Mitsubishi', count: 2140, emoji: '🇯🇵' },
  { name: 'Hyundai / Kia', count: 3350, emoji: '🇰🇷' },
  { name: 'Mazda / Subaru', count: 1870, emoji: '🇯🇵' },
]

const trustItems = [
  { icon: '📦', title: 'Доставка по всей России', text: 'Отправляем из Владивостока за 3–14 дней' },
  { icon: '🛡️', title: 'Гарантия подлинности', text: 'Только оригиналы и сертифицированные аналоги' },
  { icon: '🔧', title: 'Подбор по VIN', text: 'Бесплатная консультация мастера' },
  { icon: '⏱️', title: 'Работаем с 1998 года', text: '26 лет на рынке Дальнего Востока' },
]

const reviews = [
  { name: 'Андрей К.', city: 'Новосибирск', text: 'Заказал тормозные колодки для Camry — пришли за 9 дней. Оригинал, всё совпало. Очень доволен!', car: 'Toyota Camry 2019' },
  { name: 'Ирина М.', city: 'Москва', text: 'Менеджеры помогли подобрать амортизаторы по VIN. Доставка быстрая, упаковка надёжная. Буду заказывать ещё.', car: 'Honda CR-V 2020' },
  { name: 'Сергей Л.', city: 'Екатеринбург', text: 'Хорошая цена, быстрая обратная связь. Запчасти оказались именно те, что нужны. Рекомендую!', car: 'Nissan X-Trail 2018' },
]

function StarIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function StarEmptyIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function HomePage() {
  const [activeTab, setActiveTab] = useState('all')
  const [vinInput, setVinInput] = useState('')
  const [popularProducts, setPopularProducts] = useState<Product[]>([])
  const [popularLoading, setPopularLoading] = useState(true)
  const [popularError, setPopularError] = useState<string | null>(null)
  const { addItem } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts({ limit: 6 })
      .then(data => setPopularProducts(data.items))
      .catch(() => setPopularError('Не удалось загрузить товары'))
      .finally(() => setPopularLoading(false))
  }, [])

  return (
    <div>
      <SEO title="Главная" description="Контрактные запчасти из Японии и Кореи во Владивостоке. Оригинальные детали для Toyota, Nissan, Mitsubishi, Honda, Subaru, Mazda и других марок. Поиск по VIN, доставка по всей России." />
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900&h=600&fit=crop&auto=format')` }} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              Дальний Восток · Оригинальные запчасти
            </div>
            <h1 className={styles.heroTitle}>
              Запчасти из<br />
              <span className={styles.heroAccent}>Владивостока</span><br />
              по всей России
            </h1>
            <p className={styles.heroText}>
              Более 85 000 позиций японских и корейских автозапчастей. Прямые поставки от дилеров. Работаем с 1998 года.
            </p>
            <div className={styles.heroActions}>
              <button className="btn-accent" onClick={() => navigate('/catalog?vin=')}>
                Подобрать по VIN
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.heroArrowSvg}><path d="m9 18 6-6-6-6"/></svg>
              </button>
              <button className="btn-outline" onClick={() => navigate('/catalog')}>Каталог запчастей</button>
            </div>
            <div className={styles.heroStats}>
              {[['85 000+', 'позиций'], ['26', 'лет работы'], ['98%', 'довольных']].map(([n, l]) => (
                <div key={l}>
                  <div className={styles.heroStatValue}>{n}</div>
                  <div className={styles.heroStatLabel}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className={styles.trust}>
        <div className={styles.trustInner}>
          {trustItems.map(item => (
            <div key={item.title} className={styles.trustItem}>
              <div className={styles.trustIconWrap}>
                <span className={styles.trustIcon}>{item.icon}</span>
              </div>
              <div>
                <div className={styles.trustTitle}>{item.title}</div>
                <p className={styles.trustText}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand categories */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Марки автомобилей</h2>
          <a href="/catalog" className={styles.sectionLink}>
            Все марки
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </a>
        </div>
        <div className={styles.brandGrid}>
          {categories.map(cat => {
            const brandValue = cat.name.replace(/ \/.*$/, '').trim()
            const brands = brandValue.split(' / ').map(b => b.trim()).join(',')
            return (
            <a key={cat.name} href={`/catalog?brand=${brands}`} className={styles.brandCard}>
              <div className={styles.brandEmoji}>{cat.emoji}</div>
              <div className={styles.brandName}>{cat.name}</div>
              <div className={styles.brandCount}>{cat.count.toLocaleString()} позиций</div>
              <div className={styles.brandCta}>
                Перейти
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </a>
          )})}
        </div>
      </section>

      {/* Popular products */}
      <section className={styles.productsBg}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Популярные запчасти</h2>
            <a href="/catalog" className={styles.sectionLink}>
              Весь каталог
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </a>
          </div>

          <div className={styles.tabs}>
            {[
              ['all', 'Все'],
              ['engine', 'Двигатель'],
              ['suspension', 'Подвеска'],
              ['body', 'Кузов'],
              ['electrics', 'Электрика'],
            ].map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className={styles.productGrid}>
            {popularLoading && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.productCard}>
                <div className={styles.productImageWrap} />
                <div className={styles.productBody}>
                  <div className={styles.skeletonBlock} style={{ width: '60%' }} />
                  <div className={styles.skeletonBlock} />
                  <div className={styles.skeletonBlock} style={{ width: '40%' }} />
                </div>
              </div>
            ))}
            {popularError && <p className={styles.productError}>{popularError}</p>}
            {!popularLoading && !popularError && popularProducts.map(p => (
              <div key={p.id} className={styles.productCard}>
                <div className={styles.productImageWrap}>
                  <OptimizedImage src={p.images[0]} alt={p.name} className={styles.productImage} />
                  {p.condition === 'new' && (
                    <div className={styles.productBadge}>
                      <span className="badge-original">Новый</span>
                    </div>
                  )}
                  {!p.inStock && (
                    <div className={styles.productOutOfStock}>
                      <span>Под заказ</span>
                    </div>
                  )}
                </div>
                <div className={styles.productBody}>
                  <div className={styles.productBrand}>{p.brand} {p.model} ({p.year})</div>
                  <h3 className={styles.productName}>{p.name}</h3>
                  <div className={styles.productFooter}>
                    <div className={styles.priceWrap}>
                      <span className={styles.priceCurrent}>{p.price.toLocaleString()} ₽</span>
                    </div>
                    <button
                      onClick={() => addItem(p.id)}
                      disabled={!p.inStock}
                      className={styles.addBtn}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                      {p.inStock ? 'В корзину' : 'Заказать'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIN section */}
      <section className={styles.vinSection}>
        <div className={styles.vinInner}>
          <div className={styles.vinInfo}>
            <div className={styles.vinIconWrap}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.vinIcon}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <div>
              <div className={styles.vinLabel}>Бесплатный сервис</div>
              <h2 className={styles.vinTitle}>Подбор запчастей по VIN-номеру</h2>
              <p className={styles.vinText}>
                Введите VIN — наш специалист подберёт все необходимые запчасти точно под ваш автомобиль. Без ошибок, бесплатно.
              </p>
            </div>
          </div>
          <div className={styles.vinForm}>
            <div className={styles.vinInputRow}>
              <input
                type="text"
                placeholder="VIN (17 символов)"
                className={styles.vinInput}
                maxLength={17}
                value={vinInput}
                onChange={e => setVinInput(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === 'Enter' && vinInput.length >= 3) navigate(`/catalog?vin=${vinInput}`) }}
              />
              <button className={`btn-accent ${styles.vinButton}`} onClick={() => { if (vinInput.length >= 3) navigate(`/catalog?vin=${vinInput}`) }}>Подобрать</button>
            </div>
            <span className={styles.vinNote}>Ответим в течение 30 минут в рабочее время</span>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className={styles.brandsSection}>
        <h2 className={styles.brandsTitle}>Бренды в наличии</h2>
        <div className={styles.brandsGrid}>
          {['Toyota', 'Nissan', 'Honda', 'Mitsubishi', 'Mazda', 'Subaru', 'Hyundai', 'Kia'].map(b => (
            <div key={b} className={styles.brandPill}>
              <span className={styles.brandPillText}>{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className={styles.reviewsSection}>
        <div className={styles.reviewsInner}>
          <div className={styles.reviewsHeader}>
            <h2 className={styles.reviewsTitle}>Отзывы покупателей</h2>
            <div className={styles.reviewsOverall}>
              <div className={styles.reviewsOverallStars}>
                {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} size={13} />)}
              </div>
              <span className={styles.reviewsOverallText}>4.87 · 1 204 отзыва</span>
            </div>
          </div>
          <div className={styles.reviewsGrid}>
            {reviews.map(r => (
              <div key={r.name} className={styles.reviewCard}>
                <div className={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} size={12} />)}
                </div>
                <p className={styles.reviewText}>"{r.text}"</p>
                <div className={styles.reviewAuthor}>
                  <div>
                    <div className={styles.reviewName}>{r.name}</div>
                    <div className={styles.reviewCity}>{r.city}</div>
                  </div>
                  <div className={styles.reviewCar}>{r.car}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
