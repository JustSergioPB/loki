import { DbCredentialRequest } from "@/db/schema/credential-requests";

export const credentialChallengeStatus = [
  "used",
  "expired",
  "pending",
] as const;
export type CredentialChallengeStatus =
  (typeof credentialChallengeStatus)[number];

export type ChallengeSnapshot = Omit<DbCredentialRequest, "code"> & {
  code: number;
};

export type BurnedChallengeSnapshot = Omit<DbCredentialRequest, "code"> & {
  code: null;
};
