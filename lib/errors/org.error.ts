export const orgErrorMessages = [
  "rootNotFound",
  "notFound",
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
