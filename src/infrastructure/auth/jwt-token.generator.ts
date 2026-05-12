import { Injectable } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { TokenGenerator } from '../../domain/auth/token-generator.js';

@Injectable()
export class JwtTokenGenerator implements TokenGenerator {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  generateAccessToken(payload: { userId: string; email: string }): string {
    return this.jwtService.sign(payload, {
      privateKey: this.config.getOrThrow<string>('JWT_PRIVATE_KEY'),
      algorithm: 'RS256',
      expiresIn: this.config.getOrThrow(
        'JWT_EXPIRES_IN',
      ) as JwtSignOptions['expiresIn'],
    });
  }

  generateRefreshToken(payload: { userId: string; email: string }): string {
    return this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.getOrThrow(
        'JWT_REFRESH_EXPIRES_IN',
      ) as JwtSignOptions['expiresIn'],
    });
  }
}
