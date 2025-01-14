export const formErrorMessages = [
  "delegationFormNotFound",
  "notFound",
] as const;
export type FormErrorMessage = (typeof formErrorMessages)[number];

export class FormError extends Error {
  constructor(message: FormErrorMessage) {
    super(message);
    this.name = message;
  }
}
