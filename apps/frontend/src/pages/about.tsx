import { SEO } from '../components/seo'
import styles from './about.module.css'

export function AboutPage() {
  return (
    <div className={styles.page}>
      <SEO title="О компании" description="ВЛАДИДЕТАЛЬ — контрактные запчасти из Японии и Кореи во Владивостоке с 1998 года. Оригинальные детали для японских и корейских автомобилей." />
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>О компании ВЛАДИДЕТАЛЬ</h1>
        <p className={styles.heroText}>
          Контрактные запчасти из Владивостока — оригинальные детали
          с аукционов Японии и Кореи. Доставка по всей России.
        </p>
      </section>

      <div className={styles.grid}>
        {[
          { title: '10+ лет на рынке', text: 'С 1998 года помогаем автовладельцам находить качественные запчасти по доступным ценам.' },
          { title: 'Оригинальные детали', text: 'Работаем напрямую с японскими и корейскими аукционами. Гарантия подлинности каждой детали.' },
          { title: 'Доставка по РФ', text: 'Отправляем запчасти в любой город России. Сотрудничаем с надёжными транспортными компаниями.' },
          { title: 'Проверка перед отправкой', text: 'Каждая деталь проходит визуальный осмотр и диагностику перед отправкой клиенту.' },
        ].map(item => (
          <div key={item.title} className={styles.card}>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardText}>{item.text}</p>
          </div>
        ))}
      </div>

      <section className={styles.contacts}>
        <h2 className={styles.contactsTitle}>Контакты</h2>
        <div className={styles.contactGrid}>
          {[
            { label: 'Телефон', value: '+7 (423) 200-00-00' },
            { label: 'Email', value: 'info@vladidetali.ru' },
            { label: 'Адрес', value: 'г. Владивосток, ул. Фадеева, 47' },
            { label: 'Режим работы', value: 'пн–пт: 09:00–19:00\nсб: 10:00–17:00\nвс: выходной' },
            { label: 'ИНН', value: '2508123456' },
            { label: 'ОГРН', value: '1022500001234' },
          ].map(item => (
            <div key={item.label} className={styles.contactItem}>
              <span className={styles.contactLabel}>{item.label}</span>
              <span className={styles.contactValue} style={item.label === 'Режим работы' ? { whiteSpace: 'pre-line' } as React.CSSProperties : undefined}>{item.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
