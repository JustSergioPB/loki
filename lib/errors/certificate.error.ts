export const certificateErrorMessages = [
  "rootNotFound",
  "intermediateNotFound",
] as const;
export type CertificateErrorMessage = (typeof certificateErrorMessages)[number];

export class CertificateError extends Error {
  constructor(message: CertificateErrorMessage) {
    super(message);
    this.name = message;
  }
}
