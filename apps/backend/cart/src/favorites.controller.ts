import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { IsString } from 'class-validator'
import { FavoritesService, FavoriteResponse } from './favorites.service'

class AddFavoriteDto {
  @IsString()
  productId!: string
}

@Controller('favorites')
@UseGuards(AuthGuard('jwt'))
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  findAll(@Req() req: any): Promise<FavoriteResponse[]> {
    return this.favoritesService.findAll(req.user.userId)
  }

  @Post()
  add(@Req() req: any, @Body() dto: AddFavoriteDto): Promise<void> {
    return this.favoritesService.add(req.user.userId, dto.productId)
  }

  @Delete(':productId')
  remove(@Req() req: any, @Param('productId') productId: string): Promise<void> {
    return this.favoritesService.remove(req.user.userId, productId)
  }
}
