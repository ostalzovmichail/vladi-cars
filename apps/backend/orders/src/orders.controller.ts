import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { OrdersService } from './orders.service'
import { OrderResponse, AdminOrderResponse, UpdateStatusDto } from './dto/order.dto'
import { RolesGuard, Roles } from './roles.guard'

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@Req() req: any): Promise<OrderResponse> {
    return this.ordersService.createFromCart(req.user.userId)
  }

  @Get()
  getOrders(@Req() req: any): Promise<OrderResponse[]> {
    return this.ordersService.getUserOrders(req.user.userId)
  }

  @Get('admin')
  @Roles('admin')
  getAllOrders(): Promise<AdminOrderResponse[]> {
    return this.ordersService.findAll()
  }

  @Patch('admin/:id/status')
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto): Promise<OrderResponse> {
    return this.ordersService.updateStatus(id, dto.status)
  }

  @Get(':id')
  getOrder(@Req() req: any, @Param('id') id: string): Promise<OrderResponse> {
    return this.ordersService.getOrder(req.user.userId, id)
  }
}
