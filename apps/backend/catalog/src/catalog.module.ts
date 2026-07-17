import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { CatalogController } from './catalog.controller'
import { CatalogService } from './catalog.service'
import { ReviewsController } from './reviews.controller'
import { ReviewsService } from './reviews.service'
import { PrismaService } from './prisma.service'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'vladi-cars-secret-key-dev',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [CatalogController, ReviewsController],
  providers: [CatalogService, ReviewsService, PrismaService, JwtStrategy],
})
export class CatalogModule {}
