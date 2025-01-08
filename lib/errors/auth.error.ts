export const authErrorMessages = [
  "unauthorized",
  "forbidden",
  "invalidCredentials",
] as const;
export type AuthErrorMessage = (typeof authErrorMessages)[number];

export class AuthError extends Error {
  constructor(message: AuthErrorMessage) {
    super(message);
    this.name = message;
  }
}
