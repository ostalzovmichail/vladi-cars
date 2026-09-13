import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CartService } from './cart.service'
import { AddItemDto, UpdateQuantityDto, CartResponse } from './dto/cart.dto'

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@Req() req: any): Promise<CartResponse> {
    return this.cartService.getCart(req.user.userId)
  }

  @Post('items')
  addItem(@Req() req: any, @Body() dto: AddItemDto): Promise<CartResponse> {
    return this.cartService.addItem(req.user.userId, dto)
  }

  @Patch('items/:productId')
  updateQuantity(@Req() req: any, @Param('productId') productId: string, @Body() dto: UpdateQuantityDto): Promise<CartResponse> {
    return this.cartService.updateQuantity(req.user.userId, productId, dto)
  }

  @Delete('items/:productId')
  removeItem(@Req() req: any, @Param('productId') productId: string): Promise<CartResponse> {
    return this.cartService.removeItem(req.user.userId, productId)
  }

  @Delete()
  clearCart(@Req() req: any): Promise<void> {
    return this.cartService.clearCart(req.user.userId)
  }
}
