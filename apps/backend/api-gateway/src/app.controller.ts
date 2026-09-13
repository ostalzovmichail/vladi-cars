import { Controller, Get, Header } from '@nestjs/common'

const CATALOG_URL = process.env.CATALOG_URL || 'http://localhost:3001'
const BASE_URL = 'https://vladidetali.ru'

@Controller()
export class AppController {
  @Get('health')
  healthCheck() {
    return { status: 'ok', service: 'api-gateway' }
  }

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  async sitemap() {
    let products: { id: string; updatedAt: string }[] = []
    try {
      const res = await fetch(`${CATALOG_URL}/products?limit=1000`)
      const data = await res.json()
      products = data.items || []
    } catch {
      // fallback: empty sitemap
    }

    const staticUrls = [
      { loc: '/', priority: '1.0', changefreq: 'weekly' },
      { loc: '/catalog', priority: '0.9', changefreq: 'daily' },
      { loc: '/about', priority: '0.5', changefreq: 'monthly' },
      { loc: '/cart', priority: '0.3', changefreq: 'monthly' },
      { loc: '/favorites', priority: '0.3', changefreq: 'monthly' },
      { loc: '/orders', priority: '0.3', changefreq: 'monthly' },
      { loc: '/login', priority: '0.2', changefreq: 'monthly' },
      { loc: '/register', priority: '0.2', changefreq: 'monthly' },
    ]

    const urls = [...staticUrls]

    for (const p of products) {
      urls.push({
        loc: `/product/${p.id}`,
        priority: '0.8',
        changefreq: 'daily',
      })
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${BASE_URL}${u.loc}</loc>
    <priority>${u.priority}</priority>
    <changefreq>${u.changefreq}</changefreq>
  </url>`).join('\n')}
</urlset>`

    return xml
  }
}
