export const orgDIDErrorMessages = ["missingRootDID"] as const;
export type OrgDIDErrorMessage = (typeof orgDIDErrorMessages)[number];

export class OrgDIDError extends Error {
  constructor(message: OrgDIDErrorMessage) {
    super(message);
    this.name = message;
  }
}
