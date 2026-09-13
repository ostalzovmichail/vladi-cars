import { IsOptional, IsString, IsInt, Min, IsIn, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'

export class CatalogQueryDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsString()
  condition?: string

  @IsOptional()
  @IsString()
  brand?: string

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  minYear?: number

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  maxYear?: number

  @IsOptional()
  @IsString()
  model?: string

  @IsOptional()
  @IsString()
  @IsIn(['price-asc', 'price-desc', 'name', 'date'])
  sort?: 'price-asc' | 'price-desc' | 'name' | 'date'

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
