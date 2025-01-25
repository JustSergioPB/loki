export const credentialErrorMessages = ["encrypted", "notFound"] as const;
export type CredentialErrorMessage = (typeof credentialErrorMessages)[number];

export class CredentialError extends Error {
  constructor(message: CredentialErrorMessage) {
    super(message);
    this.name = message;
  }
}
