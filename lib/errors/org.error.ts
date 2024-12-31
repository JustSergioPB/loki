export const orgErrorMessages = [
  "notFound",
  "alreadyExists",
  "missingAddress",
  "missingUsers",
] as const;
export type OrgErrorMessage = (typeof orgErrorMessages)[number];

export class OrgError extends Error {
  constructor(message: OrgErrorMessage) {
    super(message);
    this.name = message;
  }
}
