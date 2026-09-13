import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import type { Product } from '@vladi-cars/shared-types'
import { CatalogService } from './catalog.service'
import { CatalogQueryDto, PaginatedResponse } from './dto/query.dto'
import { CreateProductDto, UpdateProductDto } from './dto/product.dto'
import { AdminGuard } from './admin.guard'

@Controller('products')
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get()
  findAll(@Query() query: CatalogQueryDto): Promise<PaginatedResponse<Product>> {
    return this.catalogService.findAll(query)
  }

  @Get('brands')
  getBrands(): Promise<string[]> {
    return this.catalogService.getBrands()
  }

  @Get('models')
  getModels(@Query('brand') brand?: string): Promise<string[]> {
    return this.catalogService.getModels(brand)
  }

  @Get('vin/:vin')
  async findByVin(@Param('vin') vin: string): Promise<{ products: Product[]; hint: string | null }> {
    return this.catalogService.findByVin(vin)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.catalogService.create(dto)
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateProductDto): Promise<Product> {
    return this.catalogService.update(id, dto)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.catalogService.remove(id)
  }

  @Post(':id/images')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string; thumbnailUrl: string; images: string[] }> {
    return this.catalogService.uploadImage(id, file)
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Product> {
    return this.catalogService.findOne(id)
  }
}
