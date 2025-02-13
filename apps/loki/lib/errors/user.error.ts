export const userErrorMessages = [
  "NOT_FOUND",
  "alreadyExists",
  "missingPosition",
] as const;
export type UserErrorMessage = (typeof userErrorMessages)[number];

export class UserError extends Error {
  constructor(message: UserErrorMessage) {
    super(message);
    this.name = message;
  }
}
