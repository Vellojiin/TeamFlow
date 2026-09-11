import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import * as argon2 from 'argon2';
import { createHash, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

interface RefreshPayload {
  sub: string;
  email: string;
  type: 'refresh';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDTO) {
    const existingUser = await this.prisma.client.user.findUnique({
      where: {
        email: dto.email.toLowerCase().trim(),
      },
    });

    if (existingUser) {
      throw new ConflictException('Usuario ya existe');
    }

    const passwordHash = await argon2.hash(dto.password);

    try {
      const user = await this.prisma.client.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          name: dto.name,
          password: passwordHash,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
      return user;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Usuario ya existe');
      }

      throw error;
    }
  }

  async login(dto: LoginDTO) {
    const user = await this.prisma.client.user.findUnique({
      where: {
        email: dto.email.toLowerCase().trim(),
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await argon2.verify(user.password, dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      type: 'access' as const,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' as const },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<JwtSignOptions['expiresIn']>(
          'JWT_REFRESH_EXPIRES_IN',
          '7d',
        ),
      },
    );

    await this.storeRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  async refresh(dto: RefreshTokenDto) {
    let payload: RefreshPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshPayload>(
        dto.refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = await this.prisma.client.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        refreshTokenHash: true,
        refreshTokenExpiresAt: true,
      },
    });

    if (
      !user?.refreshTokenHash ||
      !user.refreshTokenExpiresAt ||
      user.refreshTokenExpiresAt <= new Date() ||
      !this.matchesHash(dto.refreshToken, user.refreshTokenHash)
    ) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    return this.issueTokens(user.id, user.email);
  }

  async logout(dto: RefreshTokenDto) {
    await this.prisma.client.user.updateMany({
      where: {
        refreshTokenHash: this.hashToken(dto.refreshToken),
      },
      data: {
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      },
    });

    return { message: 'Sesión cerrada correctamente' };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  private async issueTokens(userId: string, email: string) {
    const accessToken = this.jwtService.sign({
      sub: userId,
      email,
      type: 'access' as const,
    });
    const refreshToken = this.jwtService.sign(
      { sub: userId, email, type: 'refresh' as const },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<JwtSignOptions['expiresIn']>(
          'JWT_REFRESH_EXPIRES_IN',
          '7d',
        ),
      },
    );

    await this.storeRefreshToken(userId, refreshToken);
    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string) {
    await this.prisma.client.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: this.hashToken(token),
        refreshTokenExpiresAt: this.getRefreshTokenExpiration(),
      },
    });
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private matchesHash(token: string, expectedHash: string) {
    const actual = Buffer.from(this.hashToken(token));
    const expected = Buffer.from(expectedHash);
    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  }

  private getRefreshTokenExpiration() {
    const configured = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );
    const match = /^(\d+)([smhd])$/.exec(configured);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return new Date(
      Date.now() + Number(match[1]) * units[match[2] as keyof typeof units],
    );
  }
}
