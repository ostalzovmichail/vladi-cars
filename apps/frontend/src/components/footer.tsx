import { Link } from 'react-router-dom'
import styles from './footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <div className={styles.brandTitle}>ВЛАДИДЕТАЛЬ</div>
          <p className={styles.brandDesc}>
            Интернет-магазин оригинальных автозапчастей из Владивостока. Прямые поставки от японских и корейских дилеров.
          </p>
          <div className={styles.brandBadge}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.brandBadgeIcon}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Член ТПП Владивостока
          </div>
        </div>

        <div>
          <div className={styles.columnTitle}>Каталог</div>
          <ul className={styles.list}>
            {['Японские запчасти', 'Корейские запчасти', 'Двигатель и КПП', 'Ходовая часть', 'Кузовные детали', 'Электрика и оптика'].map(i => (
              <li key={i}><Link to="/catalog">{i}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <div className={styles.columnTitle}>Покупателям</div>
          <ul className={styles.list}>
            {['Как сделать заказ', 'Оплата и доставка', 'Возврат', 'Гарантия', 'Вопрос-ответ', 'Статьи'].map(i => (
              <li key={i}><a href="#">{i}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <div className={styles.columnTitle}>Контакты</div>
          <ul className={styles.list}>
            <li>
              <div className={styles.contactItem}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.contactIcon}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                г. Владивосток, ул. Фадеева, 47
              </div>
            </li>
            <li>
              <div className={styles.contactItem}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.contactIcon}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +7 (423) 200-00-00
              </div>
            </li>
            <li>
              <div className={styles.contactItem}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.contactIcon}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Пн–Сб 9:00–19:00
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span>© 1998–2026 ВЛАДИДЕТАЛЬ. Все права защищены.</span>
          <span>ИНН 2508123456 · ОГРН 1022500001234</span>
        </div>
      </div>
    </footer>
  )
}
