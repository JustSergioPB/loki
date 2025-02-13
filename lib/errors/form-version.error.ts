export const formVersionErrorMessages = [
  "CANT_BE_PUBLISHED",
  "CANT_BE_ARCHIVED",
  "NOT_FOUND",
  "NOT_PUBLISHED",
  "PREV_VER_NOT_FOUND",
  "SEARCH_FAILED",
] as const;
export type FormVersionErrorMessage = (typeof formVersionErrorMessages)[number];

export class FormVersionError extends Error {
  constructor(message: FormVersionErrorMessage) {
    super(message);
    this.name = message;
  }
}
