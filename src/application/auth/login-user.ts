import { Injectable, Inject } from '@nestjs/common';
import { AuthError } from './error/auth.error.js';
import type { UserRepository } from '../../domain/user/user-repository.js';
import type { PasswordHasher } from '../../domain/auth/password-hasher.js';
import type { TokenGenerator } from '../../domain/auth/token-generator.js';
import {
  USER_REPOSITORY,
  PASSWORD_HASHER,
  TOKEN_GENERATOR,
} from '../../infrastructure/tokens.js';
import { LoginUserDto } from 'src/infrastructure/http/dto/login-user.dto.js';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    @Inject(TOKEN_GENERATOR) private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(input: LoginUserDto): Promise<{ accessToken: string }> {
    const existing = await this.userRepo.findByEmail(input.email);

    if (!existing) {
      throw AuthError.InvalidCredentials();
    }

    const isMatch = await this.passwordHasher.compare(
      input.password,
      existing.passwordHash,
    );

    if (!isMatch) {
      throw AuthError.InvalidCredentials();
    }

    const accessToken = this.tokenGenerator.generateAccessToken({
      userId: existing.id,
      email: existing.email,
    });
    return { accessToken };
  }
}
