import { Injectable, ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from './prisma.service'
import { RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto, AuthResponse, SafeUser } from './dto/auth.dto'
import { randomBytes } from 'crypto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (exists) throw new ConflictException('Email already registered')

    const passwordHash = await bcrypt.hash(dto.password, 10)
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
      },
    })

    return this.buildResponse(user)
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    return this.buildResponse(user)
  }

  async forgotPassword(email: string): Promise<{ message: string; token?: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) return { message: 'Если email зарегистрирован, ссылка для сброса будет отправлена' }

    const token = randomBytes(32).toString('hex')
    await this.prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    })

    return { message: 'Ссылка для сброса пароля отправлена на email', token }
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const record = await this.prisma.passwordResetToken.findUnique({ where: { token } })
    if (!record || record.used || record.expiresAt < new Date()) {
      throw new BadRequestException('Недействительный или истёкший токен')
    }

    const passwordHash = await bcrypt.hash(password, 10)
    await this.prisma.user.update({ where: { email: record.email }, data: { passwordHash } })
    await this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } })

    return { message: 'Пароль успешно изменён' }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    const data: Record<string, string> = {}
    if (dto.name !== undefined) data.name = dto.name
    if (dto.phone !== undefined) data.phone = dto.phone

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    })

    return { id: updated.id, name: updated.name, email: updated.email, phone: updated.phone ?? undefined, role: updated.role }
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    const valid = await bcrypt.compare(dto.oldPassword, user.passwordHash)
    if (!valid) throw new BadRequestException('Неверный текущий пароль')

    const passwordHash = await bcrypt.hash(dto.newPassword, 10)
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })

    return { message: 'Пароль успешно изменён' }
  }

  async validateUser(userId: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) return null
    return { id: user.id, name: user.name, email: user.email, phone: user.phone ?? undefined, role: user.role }
  }

  private buildResponse(user: { id: string; name: string; email: string; phone: string | null; role: string }): AuthResponse {
    const payload = { sub: user.id, email: user.email, role: user.role }
    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? undefined,
        role: user.role,
      },
    }
  }
}
