export const tokenErrorMessages = [
  "NOT_FOUND",
  "expired",
  "burnt",
  "invalidContext",
] as const;
export type TokenErrorMessage = (typeof tokenErrorMessages)[number];

export class TokenError extends Error {
  constructor(message: TokenErrorMessage) {
    super(message);
    this.name = message;
  }
}
