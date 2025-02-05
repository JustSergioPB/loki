export const keyErrorMessages = [
  "revoked",
  "missingVerificationMethod",
  "unsupportedType",
  "unsupportedMultibase",
] as const;
export type KeyErrorMessage = (typeof keyErrorMessages)[number];

export class KeyError extends Error {
  constructor(message: KeyErrorMessage) {
    super(message);
    this.name = message;
  }
}
