import type { RefreshToken } from './refresh-token.js';

export interface RefreshTokenRepository {
  save(userId: string, token: string): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshToken | null>;
  deleteByToken(token: string): Promise<void>;
  deleteAllByUserId(userId: string): Promise<void>;
}
