export const userDIDErrorMessages = ["missingOrgDID"] as const;
export type UserDIDErrorMessage = (typeof userDIDErrorMessages)[number];

export class UserDIDError extends Error {
  constructor(message: UserDIDErrorMessage) {
    super(message);
    this.name = message;
  }
}
