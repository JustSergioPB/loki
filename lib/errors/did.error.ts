export const DIDErrorMessages = [
  "missingOrgDID",
  "missingUserDID",
  "missingRootDID",
  "missingAssertionMethod",
] as const;
export type UserDIDErrorMessage = (typeof DIDErrorMessages)[number];

export class DIDError extends Error {
  constructor(message: UserDIDErrorMessage) {
    super(message);
    this.name = message;
  }
}
