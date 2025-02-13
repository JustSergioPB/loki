export const DidErrorMessages = [
  "ORG_DID_NOT_FOUND",
  "USER_DID_NOT_FOUND",
  "ROOT_DID_NOT_FOUND",
  "ASSERTION_METHOD_NOT_FOUND",
] as const;
export type UserDidErrorMessage = (typeof DidErrorMessages)[number];

export class DidError extends Error {
  constructor(message: UserDidErrorMessage) {
    super(message);
    this.name = message;
  }
}
