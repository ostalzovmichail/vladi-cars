import { Helmet } from 'react-helmet-async'

interface Props {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
}

const BASE_URL = 'https://vladidetali.ru'
const SITE_NAME = 'ВЛАДИДЕТАЛЬ'
const DEFAULT_DESCRIPTION = 'Контрактные запчасти из Японии и Кореи во Владивостоке. Оригинальные детали для Toyota, Nissan, Mitsubishi, Honda, Subaru, Mazda и других марок.'

export function SEO({ title, description, ogTitle, ogDescription, ogImage, ogUrl }: Props) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Автозапчасти из Японии и Кореи`
  const pageDesc = description || DEFAULT_DESCRIPTION
  const pageOgTitle = ogTitle || pageTitle
  const pageOgDesc = ogDescription || pageDesc

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageOgTitle} />
      <meta property="og:description" content={pageOgDesc} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageOgTitle} />
      <meta name="twitter:description" content={pageOgDesc} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  )
}
