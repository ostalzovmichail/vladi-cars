import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'
import { PrismaService } from './prisma.service'
import { JwtStrategy } from './jwt.strategy'
import { RolesGuard } from './roles.guard'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'vladi-cars-secret-key-dev',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    PrismaService,
    JwtStrategy,
    RolesGuard,
  ],
})
export class OrdersModule {}
