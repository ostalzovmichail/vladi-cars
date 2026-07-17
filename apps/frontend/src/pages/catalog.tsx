import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Product, ProductCategory } from '@vladi-cars/shared-types'
import { fetchProducts, fetchBrands, fetchModels, fetchVinProducts, fetchFavorites, addFavorite, removeFavorite } from '../lib/api'
import { useCart } from '../lib/cart-context'
import { useCompare } from '../lib/compare-context'
import { useAuth } from '../lib/auth-context'
import { useToast } from '../lib/toast-context'
import { ProductCardSkeleton } from '../components/skeleton'
import { OptimizedImage } from '../components/optimized-image'
import { SEO } from '../components/seo'
import styles from './catalog.module.css'

const categories: { value: ProductCategory | ''; label: string }[] = [
  { value: '', label: 'Все категории' },
  { value: 'engine', label: 'Двигатель' },
  { value: 'transmission', label: 'Трансмиссия' },
  { value: 'suspension', label: 'Подвеска' },
  { value: 'brakes', label: 'Тормозная система' },
  { value: 'body', label: 'Кузов' },
  { value: 'optics', label: 'Оптика' },
  { value: 'electronics', label: 'Электроника' },
  { value: 'interior', label: 'Салон' },
  { value: 'exhaust', label: 'Выхлопная система' },
  { value: 'cooling', label: 'Охлаждение' },
]

const conditions = [
  { value: '', label: 'Любое состояние' },
  { value: 'used', label: 'Контрактные' },
  { value: 'new', label: 'Новые' },
]

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [category, setCategory] = useState<ProductCategory | ''>((searchParams.get('category') as ProductCategory) || '')
  const [condition, setCondition] = useState<'new' | 'used' | ''>((searchParams.get('condition') as 'new' | 'used') || '')
  const [brand, setBrand] = useState(searchParams.get('brand') || '')
  const [model, setModel] = useState(searchParams.get('model') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [minYear, setMinYear] = useState(searchParams.get('minYear') || '')
  const [maxYear, setMaxYear] = useState(searchParams.get('maxYear') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'name')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const [vin, setVin] = useState(searchParams.get('vin') || '')
  const [vinHint, setVinHint] = useState<string | null>(null)
  const [items, setItems] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [brands, setBrands] = useState<string[]>([])
  const [models, setModels] = useState<string[]>([])
  const { addItem } = useCart()
  const { addItem: addCompare, hasItem, removeItem: removeCompare } = useCompare()
  const { token } = useAuth()
  const { addToast } = useToast()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const allPagesLoaded = useRef<Map<number, Product[]>>(new Map())
  const [accumulatedItems, setAccumulatedItems] = useState<Product[]>([])
  const [totalLoaded, setTotalLoaded] = useState(0)

  useEffect(() => {
    if (!token) return
    fetchFavorites(token)
      .then(items => setFavoriteIds(new Set(items.map(i => i.productId))))
      .catch(() => {})
  }, [token])

  const toggleFavorite = useCallback(async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!token) return addToast('Войдите, чтобы добавлять в избранное', 'info')
    try {
      if (favoriteIds.has(productId)) {
        await removeFavorite(token, productId)
        setFavoriteIds(prev => { const next = new Set(prev); next.delete(productId); return next })
        addToast('Удалено из избранного', 'info')
      } else {
        await addFavorite(token, productId)
        setFavoriteIds(prev => { const next = new Set(prev); next.add(productId); return next })
        addToast('Добавлено в избранное', 'success')
      }
    } catch {
      addToast('Ошибка', 'error')
    }
  }, [token, favoriteIds, addToast])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    fetchBrands().then(setBrands).catch(() => {})
  }, [])

  useEffect(() => {
    if (brand) {
      fetchModels(brand).then(setModels).catch(() => {})
    } else {
      setModels([])
    }
    setModel('')
  }, [brand])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setVinHint(null)
    setAccumulatedItems([])
    setTotalLoaded(0)
    allPagesLoaded.current.clear()
    try {
      if (vin) {
        const data = await fetchVinProducts(vin)
        setItems(data.products)
        setTotal(data.products.length)
        setTotalPages(1)
        setVinHint(data.hint)
      } else {
        const data = await fetchProducts({
          search: debouncedSearch || undefined,
          category: category || undefined,
          condition: condition || undefined,
          brand: brand || undefined,
          model: model || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          minYear: minYear ? Number(minYear) : undefined,
          maxYear: maxYear ? Number(maxYear) : undefined,
          sort: sort || undefined,
          page: 1,
          limit: 12,
        })
        setItems(data.items)
        setAccumulatedItems(data.items)
        setTotalLoaded(data.items.length)
        setTotal(data.total)
        setTotalPages(data.totalPages)
        allPagesLoaded.current.set(1, data.items)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, category, condition, brand, model, minPrice, maxPrice, minYear, maxYear, sort, vin])

  const loadMore = useCallback(async () => {
    const nextPage = Math.floor(totalLoaded / 12) + 1
    if (nextPage > totalPages || loadingMore) return

    if (allPagesLoaded.current.has(nextPage)) {
      const existing = allPagesLoaded.current.get(nextPage)!
      setAccumulatedItems(prev => [...prev, ...existing])
      setTotalLoaded(prev => prev + existing.length)
      setItems(existing)
      setPage(nextPage)
      return
    }

    setLoadingMore(true)
    try {
      const data = await fetchProducts({
        search: debouncedSearch || undefined,
        category: category || undefined,
        condition: condition || undefined,
        brand: brand || undefined,
        model: model || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minYear: minYear ? Number(minYear) : undefined,
        maxYear: maxYear ? Number(maxYear) : undefined,
        sort: sort || undefined,
        page: nextPage,
        limit: 12,
      })
      allPagesLoaded.current.set(nextPage, data.items)
      setAccumulatedItems(prev => [...prev, ...data.items])
      setTotalLoaded(prev => prev + data.items.length)
      setItems(data.items)
      setPage(nextPage)
    } catch {
      addToast('Ошибка при загрузке', 'error')
    } finally {
      setLoadingMore(false)
    }
  }, [debouncedSearch, category, condition, brand, model, minPrice, maxPrice, minYear, maxYear, sort, totalPages, totalLoaded, loadingMore, addToast])

  useEffect(() => { load() }, [load])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (category) params.set('category', category)
    if (condition) params.set('condition', condition)
    if (brand) params.set('brand', brand)
    if (model) params.set('model', model)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (minYear) params.set('minYear', minYear)
    if (maxYear) params.set('maxYear', maxYear)
    if (sort && sort !== 'name') params.set('sort', sort)
    if (page > 1) params.set('page', String(page))
    if (vin) params.set('vin', vin)
    setSearchParams(params, { replace: true })
  }, [debouncedSearch, category, condition, brand, model, minPrice, maxPrice, minYear, maxYear, sort, page, vin, setSearchParams])

  function goToPage(p: number) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (allPagesLoaded.current.has(p)) {
      setItems(allPagesLoaded.current.get(p)!)
    }
  }

  function setFilter<T>(setter: (v: T) => void, value: T) {
    setter(value)
    setPage(1)
  }

  function removeFilter(key: string) {
    setPage(1)
    switch (key) {
      case 'search': setSearch(''); setDebouncedSearch(''); break
      case 'category': setCategory(''); break
      case 'condition': setCondition(''); break
      case 'brand': setBrand(''); break
      case 'model': setModel(''); break
      case 'minPrice': setMinPrice(''); break
      case 'maxPrice': setMaxPrice(''); break
      case 'minYear': setMinYear(''); break
      case 'maxYear': setMaxYear(''); break
    }
  }

  function resetFilters() {
    setSearch('')
    setDebouncedSearch('')
    setCategory('')
    setCondition('')
    setBrand('')
    setModel('')
    setMinPrice('')
    setMaxPrice('')
    setMinYear('')
    setMaxYear('')
    setSort('name')
    setPage(1)
    setVin('')
  }

  const filterLabels: [string, string][] = []
  if (debouncedSearch) filterLabels.push(['search', `Поиск: "${debouncedSearch}"`])
  if (category) filterLabels.push(['category', categories.find(c => c.value === category)?.label || category])
  if (condition) filterLabels.push(['condition', condition === 'new' ? 'Новые' : 'Контрактные'])
  if (brand) filterLabels.push(['brand', brand])
  if (model) filterLabels.push(['model', model])
  if (minPrice) filterLabels.push(['minPrice', `от ${Number(minPrice).toLocaleString()} ₽`])
  if (maxPrice) filterLabels.push(['maxPrice', `до ${Number(maxPrice).toLocaleString()} ₽`])
  if (minYear) filterLabels.push(['minYear', `с ${minYear} г.`])
  if (maxYear) filterLabels.push(['maxYear', `по ${maxYear} г.`])

  const hasFilters = filterLabels.length > 0 || vin

  const visiblePages: number[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  for (let i = start; i <= end; i++) visiblePages.push(i)

  return (
    <div className={styles.page}>
      <SEO title={vin ? `Поиск по VIN: ${vin}` : 'Каталог'} description={`Каталог автозапчастей из Японии и Кореи. ${category ? `Категория: ${categories.find(c => c.value === category)?.label}` : ''} ${brand ? `Бренд: ${brand}` : ''} Поиск по марке, модели, VIN.`} />
      <h1 className={styles.title}>{vin ? `Поиск по VIN: ${vin}` : 'Каталог запчастей'}</h1>
      {vinHint && <p className={styles.vinHint}>{vinHint}</p>}

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <input
            type="text"
            placeholder="Поиск по марке, модели, названию..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className={styles.searchInput}
            list="search-suggestions"
          />
          <datalist id="search-suggestions">
            {brands.map(b => <option key={b} value={b} />)}
          </datalist>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
        <select value={category} onChange={e => { setCategory(e.target.value as ProductCategory | ''); setPage(1) }} className={styles.select}>
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={condition} onChange={e => { setCondition(e.target.value as 'new' | 'used' | ''); setPage(1) }} className={styles.select}>
          {conditions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={brand} onChange={e => { setBrand(e.target.value); setPage(1) }} className={styles.select}>
          <option value="">Все бренды</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        {brand && (
          <select value={model} onChange={e => { setModel(e.target.value); setPage(1) }} className={styles.select}>
            <option value="">Все модели</option>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        )}
        <input
          type="number"
          placeholder="Цена от"
          value={minPrice}
          onChange={e => { setMinPrice(e.target.value); setPage(1) }}
          className={styles.priceInput}
          min={0}
        />
        <input
          type="number"
          placeholder="Цена до"
          value={maxPrice}
          onChange={e => { setMaxPrice(e.target.value); setPage(1) }}
          className={styles.priceInput}
          min={0}
        />
        <input
          type="number"
          placeholder="Год от"
          value={minYear}
          onChange={e => { setMinYear(e.target.value); setPage(1) }}
          className={styles.priceInput}
          min={1980}
          max={2030}
        />
        <input
          type="number"
          placeholder="Год до"
          value={maxYear}
          onChange={e => { setMaxYear(e.target.value); setPage(1) }}
          className={styles.priceInput}
          min={1980}
          max={2030}
        />
        <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }} className={styles.select}>
          <option value="name">По названию</option>
          <option value="price-asc">Сначала дешёвые</option>
          <option value="price-desc">Сначала дорогие</option>
          <option value="date">Сначала новые</option>
        </select>
        {hasFilters && (
          <button onClick={resetFilters} className={styles.resetBtn}>
            Сбросить всё
          </button>
        )}
      </div>

      {!loading && !error && !vin && hasFilters && (
        <div className={styles.activeFilters}>
          {filterLabels.map(([key, label]) => (
            <button key={key} className={styles.filterBadge} onClick={() => removeFilter(key)}>
              {label} <span className={styles.filterBadgeX}>✕</span>
            </button>
          ))}
        </div>
      )}

      {!loading && !error && !vin && (
        <p className={styles.count}>Найдено: {total} товаров</p>
      )}

      {loading && (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      )}
      {error && <p className={styles.empty}>{error}</p>}

      {!loading && !error && (
        <div className={styles.grid}>
          {items.map(product => (
            <div key={product.id} className={styles.card}>
              <Link to={`/product/${product.id}`} className={styles.cardLink}>
                <div className={styles.cardImage}>
                  <OptimizedImage src={product.images[0]} alt={product.name} className={styles.cardImageImg} />
                  {product.condition === 'new' && <span className={`badge-original ${styles.badgePos}`}>Новый</span>}
                  <button
                    onClick={(e) => toggleFavorite(product.id, e)}
                    className={`${styles.favBtn} ${styles.favBtnPos}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={favoriteIds.has(product.id) ? '#c8191a' : 'none'} stroke={favoriteIds.has(product.id) ? '#c8191a' : 'rgba(0,0,0,0.3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </button>
                  {!product.inStock && (
                    <div className={styles.cardOutOfStock}>
                      <span>Под заказ</span>
                    </div>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>{product.brand} {product.model} ({product.year})</div>
                  <h3 className={styles.cardTitle}>{product.name}</h3>
                </div>
              </Link>

              <div className={styles.cardCompare}>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    if (hasItem(product.id)) {
                      removeCompare(product.id)
                      addToast('Удалено из сравнения', 'info')
                    } else {
                      addCompare(product)
                      addToast('Добавлено в сравнение', 'success')
                    }
                  }}
                  className={`${styles.compareBtn} ${hasItem(product.id) ? styles.compareBtnActive : ''}`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  {hasItem(product.id) ? 'В сравнении' : 'Сравнить'}
                </button>
              </div>

              <div className={styles.cardFooter}>
                <div>
                  <span className={styles.cardPrice}>{product.price.toLocaleString()} ₽</span>
                  {product.condition === 'used' && <span className={styles.cardOldPrice}>{(product.price * 1.2).toFixed(0)} ₽</span>}
                </div>
                <button
                  onClick={() => { addItem(product.id); addToast('Товар добавлен в корзину', 'success') }}
                  disabled={!product.inStock}
                  className={styles.addBtn}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                  {product.inStock ? 'В корзину' : 'Заказать'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className={styles.empty}>Ничего не найдено</p>
      )}

      {totalPages > 1 && (
        <>
          {page < totalPages && (
            <div className={styles.loadMoreWrap}>
              <button
                className={styles.loadMoreBtn}
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Загрузка...' : `Показать ещё`}
              </button>
              <p className={styles.loadMoreInfo}>
                Показано {totalLoaded} из {total} товаров
              </p>
            </div>
          )}
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>Страница {page} из {totalPages}</span>
            <div className={styles.pageControls}>
              <button
                className={styles.pageBtn}
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                ‹ Назад
              </button>
              {start > 1 && (
                <>
                  <button className={styles.pageBtn} onClick={() => goToPage(1)}>1</button>
                  {start > 2 && <span className={styles.pageDots}>...</span>}
                </>
              )}
              {visiblePages.map(p => (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                  onClick={() => goToPage(p)}
                >
                  {p}
                </button>
              ))}
              {end < totalPages && (
                <>
                  {end < totalPages - 1 && <span className={styles.pageDots}>...</span>}
                  <button className={styles.pageBtn} onClick={() => goToPage(totalPages)}>{totalPages}</button>
                </>
              )}
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Вперед ›
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
