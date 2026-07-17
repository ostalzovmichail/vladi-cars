import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../lib/cart-context'
import { useAuth } from '../lib/auth-context'
import styles from './header.module.css'

const japaneseBrands = ['Toyota', 'Nissan', 'Mitsubishi', 'Honda', 'Subaru', 'Mazda', 'Suzuki', 'Lexus', 'Infiniti', 'Isuzu']
const koreanBrands = ['Hyundai', 'Kia', 'Daewoo', 'SsangYong', 'Genesis']

const navItems = [
  { label: 'Все запчасти', path: '/catalog' },
  { label: 'Японские авто', path: `/catalog?brand=${japaneseBrands.join(',')}` },
  { label: 'Корейские авто', path: `/catalog?brand=${koreanBrands.join(',')}` },
  { label: 'Двигатель', path: '/catalog?category=engine' },
  { label: 'Подвеска', path: '/catalog?category=suspension' },
  { label: 'Кузов', path: '/catalog?category=body' },
  { label: 'Электрика', path: '/catalog?category=electronics' },
  { label: 'Расходники', path: '/catalog?category=exhaust&category=cooling&category=electronics' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const location = useLocation()
  const { items } = useCart()
  const { user, logout } = useAuth()
  const cartCount = items.reduce((s, i) => s + i.quantity, 0)

  function handleSearch() {
    if (search.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(search.trim())}`)
    }
  }
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.topBarLeft}>
            <span className={styles.topBarItem}>📍 г. Владивосток, ул. Фадеева, 47</span>
            <span className={styles.topBarItem}>🕐 Пн–Сб 9:00–19:00</span>
          </div>
          <a href="tel:+74232000000" className={styles.topBarPhone}>
            📞 +7 (423) 200-00-00
          </a>
        </div>
      </div>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerRow}>
            <Link to="/" className={styles.logo}>
              <div className={styles.logoTitle}>ВЛАДИДЕТАЛЬ</div>
              <div className={styles.logoSub}>Владивосток · с 1998</div>
            </Link>

            {!isHome && (
              <div className={styles.searchWrap}>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="Поиск по артикулу, марке, модели..."
                    className={styles.searchInput}
                  />
                  <button className={styles.searchBtn} onClick={handleSearch}> 
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </button>
              </div>
            )}

            <div className={styles.actions}>
              {user ? (
                <Link to="/profile" className={styles.actionBtn}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span className={styles.actionLabel}>{user.name}</span>
                </Link>
              ) : (
                <Link to="/login" className={styles.actionBtn}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  <span className={styles.actionLabel}>Войти</span>
                </Link>
              )}
              <Link to="/cart" className={styles.actionBtn}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                <span className={styles.actionLabel}>Корзина</span>
                {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
              </Link>
            </div>

            <button className={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {menuOpen ? <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></> : <><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>}
              </svg>
            </button>
          </div>

          <nav className={styles.nav}>
            {user && (
              <>
                {user.role === 'admin' && <Link to="/admin/orders" className={styles.navLink}>Админка</Link>}
                {user.role === 'admin' && <Link to="/admin/products" className={styles.navLink}>Товары</Link>}
                <Link to="/orders" className={styles.navLink}>Мои заказы</Link>
                <Link to="/favorites" className={styles.navLink}>Избранное</Link>
                <Link to="/profile" className={styles.navLink}>Профиль</Link>
                <button onClick={logout} className={`${styles.navLink} ${styles.logoutBtn}`}>
                  Выйти
                </button>
              </>
            )}
            {navItems.map(item => (
              <Link
                key={item.label}
                to={item.path}
                className={styles.navLink}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
            <div className={styles.mobileActions}>
              <Link to="/cart" className={styles.mobileActionBtn} onClick={() => setMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                <span>Корзина</span>
                {cartCount > 0 && <span className={styles.mobileBadge}>{cartCount}</span>}
              </Link>
              {user ? (
                <>
                  <Link to="/profile" className={styles.mobileActionBtn} onClick={() => setMenuOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>Профиль</span>
                  </Link>
                  <Link to="/orders" className={styles.mobileActionBtn} onClick={() => setMenuOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    <span>Мои заказы</span>
                  </Link>
                  <Link to="/favorites" className={styles.mobileActionBtn} onClick={() => setMenuOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    <span>Избранное</span>
                  </Link>
                  {user.role === 'admin' && (
                    <>
                      <Link to="/admin/orders" className={styles.mobileActionBtn} onClick={() => setMenuOpen(false)}>
                        <span>Админка</span>
                      </Link>
                      <Link to="/admin/products" className={styles.mobileActionBtn} onClick={() => setMenuOpen(false)}>
                        <span>Товары</span>
                      </Link>
                    </>
                  )}
                  <button onClick={() => { logout(); setMenuOpen(false) }} className={styles.mobileActionBtn}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    <span>Выйти</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className={styles.mobileActionBtn} onClick={() => setMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  <span>Войти</span>
                </Link>
              )}
            </div>
            <div className={styles.mobileNavDivider} />
            {navItems.map(item => (
              <Link key={item.label} to={item.path} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>
    </>
  )
}
