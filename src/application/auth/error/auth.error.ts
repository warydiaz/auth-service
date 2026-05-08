import { BaseError } from 'src/error';

export class AuthError extends BaseError {
  private constructor(code: number, message: string) {
    super(code, message);
  }

  static EmailAlreadyRegistered() {
    return new AuthError(409, `User already exists`);
  }

  static InvalidCredentials() {
    return new AuthError(401, `Invalid credentials`);
  }

  static InsufficientRole() {
    return new AuthError(
      403,
      `You don't have the required role to perform this action`,
    );
  }
}
