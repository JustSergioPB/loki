export const credentialRequestErrorMessages = [
  "notFound",
  "isBurnt",
  "isExpired",
] as const;
export type CredentialRequestErrorMessage =
  (typeof credentialRequestErrorMessages)[number];

export class CredentialRequestError extends Error {
  constructor(message: CredentialRequestErrorMessage) {
    super(message);
    this.name = message;
  }
}
