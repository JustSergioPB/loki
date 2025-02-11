export const credentialStatuses = [
  "empty",
  "presented",
  "with-content",
  "filled",
  "signed",
  "claimed",
] as const;
export type CredentialStatus = (typeof credentialStatuses)[number];
