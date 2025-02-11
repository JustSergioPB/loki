export const credentialStatuses = [
  "empty",
  "presented",
  "partiallyFilled",
  "filled",
  "signed",
  "claimed",
] as const;
export type CredentialStatus = (typeof credentialStatuses)[number];
