import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import type { PasswordHasher } from '../../domain/auth/password-hasher.js';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  private readonly saltRounds = 10;

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
