import { Link } from 'react-router-dom'
import { useCompare } from '../lib/compare-context'
import { OptimizedImage } from '../components/optimized-image'
import { SEO } from '../components/seo'

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1280,
    margin: '0 auto',
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'Oswald, sans-serif',
    fontSize: 30,
    fontWeight: 700,
    textTransform: 'uppercase',
    margin: '0 0 4px',
  },
  count: {
    fontSize: 13,
    color: '#7a7a82',
    margin: '0 0 24px',
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
  wrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 600,
  },
  labelCell: {
    padding: '12px 16px',
    fontSize: 12,
    color: '#7a7a82',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 600,
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    width: 140,
    verticalAlign: 'top',
    background: '#f9f8f6',
  },
  valueCell: {
    padding: '12px 16px',
    fontSize: 14,
    color: '#1a1a1e',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    textAlign: 'center',
    verticalAlign: 'top',
  },
  imageWrap: {
    width: '100%',
    height: 180,
    background: '#eeecea',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  name: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1a1a1e',
    margin: '0 0 4px',
  },
  meta: {
    fontSize: 11,
    color: '#7a7a82',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 12,
  },
  price: {
    fontFamily: 'Oswald, sans-serif',
    fontSize: 22,
    fontWeight: 700,
    color: '#c8191a',
  },
  removeBtn: {
    padding: '6px 14px',
    fontSize: 12,
    border: '1px solid rgba(0,0,0,0.10)',
    borderRadius: 999,
    background: 'white',
    color: '#7a7a82',
    cursor: 'pointer',
    marginTop: 8,
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    fontSize: 11,
    borderRadius: 999,
    fontWeight: 600,
  },
  inStock: {
    background: '#e6f7ed',
    color: '#1a7d42',
  },
  outOfStock: {
    background: '#fef2f2',
    color: '#c8191a',
  },
  headerCell: {
    padding: 0,
    borderBottom: '1px solid rgba(0,0,0,0.06)',
  },
}

const fieldLabels: Record<string, string> = {
  brand: 'Бренд',
  model: 'Модель',
  year: 'Год',
  category: 'Категория',
  condition: 'Состояние',
  price: 'Цена',
  inStock: 'Наличие',
}

const categoryLabels: Record<string, string> = {
  engine: 'Двигатель',
  transmission: 'Трансмиссия',
  suspension: 'Подвеска',
  brakes: 'Тормозная система',
  body: 'Кузов',
  optics: 'Оптика',
  electronics: 'Электроника',
  interior: 'Салон',
  exhaust: 'Выхлопная система',
  cooling: 'Охлаждение',
}

export function ComparePage() {
  const { items, removeItem, clearAll } = useCompare()

  if (items.length === 0) {
    return (
      <div style={styles.page}>
        <SEO title="Сравнение" description="Сравнение товаров на Владидеталь" />
        <div style={styles.empty}>
          <h1 style={styles.emptyTitle}>Нет товаров для сравнения</h1>
          <p style={styles.emptyText}>Добавьте товары из каталога или избранного</p>
          <Link to="/catalog" className="btn-accent" style={{ textDecoration: 'none' }}>Перейти в каталог</Link>
        </div>
      </div>
    )
  }

  const fields = ['brand', 'model', 'year', 'category', 'condition', 'price', 'inStock'] as const

  return (
    <div style={styles.page}>
      <SEO title="Сравнение" description={`Сравнение ${items.length} товаров на Владидеталь`} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 style={styles.title}>Сравнение</h1>
        <button onClick={clearAll} className="btn-outline" style={{ fontSize: 12, padding: '6px 14px' }}>Очистить</button>
      </div>
      <p style={styles.count}>{items.length} товара</p>

      <div style={styles.wrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.labelCell, borderBottom: 'none' }}></th>
              {items.map(product => (
                <th key={product.id} style={styles.headerCell}>
                  <div style={{ padding: '12px 16px' }}>
                    <div style={styles.imageWrap}>
                      <img src={product.images[0] || ''} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h2 style={styles.name}>{product.name}</h2>
                    <div style={styles.meta}>{product.brand} {product.model} ({product.year})</div>
                    <div style={styles.price}>{product.price.toLocaleString()} ₽</div>
                    <button onClick={() => removeItem(product.id)} style={styles.removeBtn}>Удалить</button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map(field => (
              <tr key={field}>
                <td style={styles.labelCell}>{fieldLabels[field]}</td>
                {items.map(product => {
                  let value: React.ReactNode = null
                  if (field === 'category') {
                    value = categoryLabels[product.category] || product.category
                  } else if (field === 'condition') {
                    value = product.condition === 'new' ? 'Новый' : 'Контрактный'
                  } else if (field === 'inStock') {
                    value = product.inStock
                      ? <span style={{ ...styles.badge, ...styles.inStock }}>В наличии</span>
                      : <span style={{ ...styles.badge, ...styles.outOfStock }}>Под заказ</span>
                  } else if (field === 'price') {
                    value = `${product.price.toLocaleString()} ₽`
                  } else if (field === 'year') {
                    value = product.year
                  } else if (field === 'brand') {
                    value = product.brand
                  } else if (field === 'model') {
                    value = product.model
                  }
                  return <td key={product.id} style={styles.valueCell}>{value}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
