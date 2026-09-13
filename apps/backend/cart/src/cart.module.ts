import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { CartController } from './cart.controller'
import { CartService } from './cart.service'
import { FavoritesController } from './favorites.controller'
import { FavoritesService } from './favorites.service'
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
  controllers: [CartController, FavoritesController],
  providers: [CartService, FavoritesService, PrismaService, JwtStrategy],
})
export class CartModule {}
