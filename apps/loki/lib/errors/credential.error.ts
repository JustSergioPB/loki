export const credentialErrorMessages = ["encrypted"] as const;
export type CredentialErrorMessage = (typeof credentialErrorMessages)[number];

export class CredentialError extends Error {
  constructor(message: CredentialErrorMessage) {
    super(message);
    this.name = message;
  }
}
