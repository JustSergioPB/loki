export const didErrorMessages = ["replacementPurposeNotMatching"] as const;
export type DIDErrorMessage = (typeof didErrorMessages)[number];

export class DIDError extends Error {
  constructor(message: DIDErrorMessage) {
    super(message);
    this.name = message;
  }
}
