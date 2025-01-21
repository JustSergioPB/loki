export const formVersionErrorMessages = [
  "cantBePublished",
  "cantBeArchived",
  "notFound",
  "notPublished",
  "latestVersionNotFound",
] as const;
export type FormVersionErrorMessage = (typeof formVersionErrorMessages)[number];

export class FormVersionError extends Error {
  constructor(message: FormVersionErrorMessage) {
    super(message);
    this.name = message;
  }
}
