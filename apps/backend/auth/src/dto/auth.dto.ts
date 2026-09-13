import { IsString, IsEmail, MinLength, MaxLength, IsOptional, Matches } from 'class-validator'

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string

  @IsEmail()
  email!: string

  @IsString()
  @MinLength(6)
  password!: string

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s\-()]{7,20}$/, { message: 'Неверный формат телефона' })
  phone?: string
}

export class LoginDto {
  @IsEmail()
  email!: string

  @IsString()
  password!: string
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s\-()]{7,20}$/, { message: 'Неверный формат телефона' })
  phone?: string
}

export class ChangePasswordDto {
  @IsString()
  oldPassword!: string

  @IsString()
  @MinLength(6)
  newPassword!: string
}

export class AuthResponse {
  token!: string
  user!: {
    id: string
    name: string
    email: string
    phone?: string
    role: string
  }
}

export interface SafeUser {
  id: string
  name: string
  email: string
  phone?: string
  role: string
}
