import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max, MinLength, MaxLength, IsIn } from 'class-validator'

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsNumber()
  @Min(0)
  price!: number

  @IsOptional()
  @IsString()
  currency?: string

  @IsOptional()
  images?: string[]

  @IsString()
  category!: string

  @IsString()
  brand!: string

  @IsOptional()
  @IsString()
  modelName?: string

  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(2030)
  year?: number

  @IsOptional()
  @IsString()
  @IsIn(['new', 'used'])
  condition?: string

  @IsOptional()
  @IsBoolean()
  inStock?: boolean
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number

  @IsOptional()
  @IsString()
  currency?: string

  @IsOptional()
  images?: string[]

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsString()
  brand?: string

  @IsOptional()
  @IsString()
  modelName?: string

  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(2030)
  year?: number

  @IsOptional()
  @IsString()
  @IsIn(['new', 'used'])
  condition?: string

  @IsOptional()
  @IsBoolean()
  inStock?: boolean
}
