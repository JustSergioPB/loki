export const formVersionErrorMessages = [
  "cantBePublished",
  "cantBeArchived",
  "notFound",
  "publishedVersionNotFound",
  "latestVersionNotFound",
] as const;
export type FormVersionErrorMessage = (typeof formVersionErrorMessages)[number];

export class FormVersionError extends Error {
  constructor(message: FormVersionErrorMessage) {
    super(message);
    this.name = message;
  }
}
