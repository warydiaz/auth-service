import { Injectable, Inject } from '@nestjs/common';
import type { User } from '../../domain/user/user.js';
import { AuthError } from './error/auth.error.js';
import { RegisterUserDto } from '../../infrastructure/http/dto/index.js';
import type { UserRepository } from '../../domain/user/user-repository.js';
import type { PasswordHasher } from '../../domain/auth/password-hasher.js';
import {
  USER_REPOSITORY,
  PASSWORD_HASHER,
} from '../../infrastructure/tokens.js';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterUserDto): Promise<Omit<User, 'passwordHash'>> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw AuthError.EmailAlreadyRegistered();
    }

    const hashed = await this.passwordHasher.hash(input.password);

    const user = await this.userRepo.save({
      email: input.email,
      passwordHash: hashed,
      name: input.name,
    } as User);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
