export abstract class BaseError extends Error {
  protected constructor(
    readonly code: number,
    readonly message: string,
  ) {
    super(message);
  }
}
