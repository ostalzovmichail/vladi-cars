import { Link } from 'react-router-dom'
import { useCompare } from '../lib/compare-context'
import { OptimizedImage } from './optimized-image'

const styles: Record<string, React.CSSProperties> = {
  bar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    background: 'white',
    borderTop: '1px solid rgba(0,0,0,0.10)',
    boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    transition: 'transform 0.2s',
  },
  hidden: {
    transform: 'translateY(100%)',
  },
  visible: {
    transform: 'translateY(0)',
  },
  items: {
    display: 'flex',
    gap: 8,
    flex: 1,
    overflow: 'auto',
  },
  thumb: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    background: '#eeecea',
    flexShrink: 0,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: '50%',
    border: 'none',
    background: '#c8191a',
    color: 'white',
    fontSize: 10,
    lineHeight: '18px',
    textAlign: 'center',
    cursor: 'pointer',
    padding: 0,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  count: {
    fontSize: 13,
    color: '#7a7a82',
    whiteSpace: 'nowrap',
  },
  compareBtn: {
    padding: '8px 20px',
    fontFamily: 'Oswald, sans-serif',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 600,
    borderRadius: 999,
    border: 'none',
    background: '#c8191a',
    color: 'white',
    cursor: 'pointer',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  clearBtn: {
    padding: '6px 14px',
    fontFamily: 'Oswald, sans-serif',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 600,
    borderRadius: 999,
    border: '1px solid rgba(0,0,0,0.10)',
    background: 'white',
    color: '#7a7a82',
    cursor: 'pointer',
  },
}

export function CompareBar() {
  const { items, removeItem, clearAll } = useCompare()

  return (
    <div style={{ ...styles.bar, ...(items.length > 0 ? styles.visible : styles.hidden) }}>
      <div style={styles.items}>
        {items.map(product => (
          <div key={product.id} style={styles.thumb}>
            <OptimizedImage
              src={product.images[0]}
              alt={product.name}
              width={48}
              height={48}
            />
            <button
              onClick={() => removeItem(product.id)}
              style={styles.removeBtn}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div style={styles.actions}>
        <span style={styles.count}>{items.length} / 4</span>
        <button onClick={clearAll} style={styles.clearBtn}>Очистить</button>
        <Link to="/compare" style={styles.compareBtn}>Сравнить</Link>
      </div>
    </div>
  )
}
