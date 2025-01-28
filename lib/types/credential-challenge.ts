export const credentialChallengeStatus = [
  "used",
  "expired",
  "pending",
] as const;
export type CredentialChallengeStatus =
  (typeof credentialChallengeStatus)[number];
