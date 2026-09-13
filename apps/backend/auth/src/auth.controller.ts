import { Controller, Post, Body, Get, Patch, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto, AuthResponse, SafeUser } from './dto/auth.dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto)
  }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto)
  }

  @Post('forgot-password')
  forgotPassword(@Body('email') email: string): Promise<{ message: string; token?: string }> {
    return this.authService.forgotPassword(email)
  }

  @Post('reset-password')
  resetPassword(@Body('token') token: string, @Body('password') password: string): Promise<{ message: string }> {
    return this.authService.resetPassword(token, password)
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Req() req: any): Promise<SafeUser | null> {
    return this.authService.validateUser(req.user.userId)
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto): Promise<SafeUser> {
    return this.authService.updateProfile(req.user.userId, dto)
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto): Promise<{ message: string }> {
    return this.authService.changePassword(req.user.userId, dto)
  }
}
