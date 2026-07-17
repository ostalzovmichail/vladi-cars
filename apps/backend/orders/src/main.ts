import { config } from 'dotenv'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './http-exception.filter'
import { logger } from './logger'

const envPath = resolve(process.cwd(), '.env')
if (!existsSync(envPath)) {
  config({ path: resolve(__dirname, '../../.env') })
} else {
  config({ path: envPath })
}

async function bootstrap() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required')
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  app.useGlobalFilters(new HttpExceptionFilter())
  app.enableCors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' })
  const port = process.env.PORT || 3003
  await app.listen(port)
  logger.info({ port }, 'Orders service started')
}
bootstrap()
