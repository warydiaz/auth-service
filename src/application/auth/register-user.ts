import type { User } from '../../domain/user/user.js';
import { AuthError } from './error/index.js';
import { RegisterUserDto } from '../infrastructure/http/dto/index.js';
import { UserRepository } from '../domain/user/user-repository.js';
import { PasswordHasher } from '../domain/auth/password-hasher.js';

export class RegisterUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterUserDto): Promise<Omit<User, 'passwordHash'>> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw AuthError.EmailAlreadyRegistered();
    }

    const hashed = await this.passwordHasher.hash(input.password);

    const user = await this.userRepo.save({
      email: input.email,
      password: hashed,
      name: input.name,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
