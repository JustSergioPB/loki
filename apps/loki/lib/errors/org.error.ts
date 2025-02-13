export const orgErrorMessages = [
  "rootNotFound",
  "NOT_FOUND",
  "alreadyExists",
  "nonRegistered",
  "duplicateBridge",
  "duplicateDomain",
] as const;
export type OrgErrorMessage = (typeof orgErrorMessages)[number];

export class OrgError extends Error {
  constructor(message: OrgErrorMessage) {
    super(message);
    this.name = message;
  }
}
