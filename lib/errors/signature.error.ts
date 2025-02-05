export const signatureErrorMessages = ["invalid"] as const;
export type SignatureErrorMessage = (typeof signatureErrorMessages)[number];

export class SignatureError extends Error {
  constructor(message: SignatureErrorMessage) {
    super(message);
    this.name = message;
  }
}
