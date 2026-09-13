import { Link } from 'react-router-dom'
import { SEO } from '../components/seo'
import styles from './not-found.module.css'

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <SEO title="404 — Страница не найдена" description="Запрашиваемая страница не найдена. Вернитесь на главную Владидеталь." />
      <h1 className={styles.code}>404</h1>
      <h2 className={styles.title}>Страница не найдена</h2>
      <p className={styles.text}>Такой страницы нет. Возможно, она была удалена или вы ошиблись в адресе.</p>
      <Link to="/" className="btn-accent">
        На главную
      </Link>
    </div>
  )
}
