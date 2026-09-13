import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { HttpExceptionFilter } from './http-exception.filter'
import { LoggingInterceptor } from './lib/logging.interceptor'
import { logger } from './lib/logger'
import type { Request, Response, NextFunction } from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  app.useGlobalFilters(new HttpExceptionFilter())
  app.enableCors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' })

  const targets = {
    catalog: process.env.CATALOG_URL || 'http://localhost:3001',
    auth: process.env.AUTH_URL || 'http://localhost:3004',
    cart: process.env.CART_URL || 'http://localhost:3002',
    orders: process.env.ORDERS_URL || 'http://localhost:3003',
  }

  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now()
    res.on('finish', () => {
      const duration = Date.now() - start
      logger.info(
        { method: req.method, url: req.originalUrl, statusCode: res.statusCode, duration: `${duration}ms` },
        'proxy request',
      )
    })
    next()
  })

  app.use(
    createProxyMiddleware({
      changeOrigin: true,
      pathFilter: ['/products', '/auth', '/cart', '/orders', '/favorites', '/uploads', '/sitemap.xml'],
      router: {
        '/products': targets.catalog,
        '/uploads': targets.catalog,
        '/auth': targets.auth,
        '/cart': targets.cart,
        '/orders': targets.orders,
        '/favorites': targets.cart,
      },
    }),
  )

  const port = process.env.PORT || 3000
  await app.listen(port)
  logger.info({ port, ...targets }, 'API Gateway started')
}
bootstrap()
