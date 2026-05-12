export interface TokenGenerator {
  generateAccessToken(payload: { userId: string; email: string }): string;
  generateRefreshToken(payload: { userId: string; email: string }): string;
}
