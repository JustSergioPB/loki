export const keyErrorMessages = [
  "REVOKED",
  "MISSING_VERIFICATION_METHOD",
  "UNSUPPORTED_TYPE",
  "UNSUPPORTED_MULTIBASE",
] as const;
export type KeyErrorMessage = (typeof keyErrorMessages)[number];

export class KeyError extends Error {
  constructor(message: KeyErrorMessage) {
    super(message);
    this.name = message;
  }
}
