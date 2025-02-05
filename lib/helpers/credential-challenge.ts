import { DbCredentialRequest } from "@/db/schema/credential-requests";
import { CredentialChallengeStatus } from "../types/credential-challenge";

export function getCredentialChallengeStatus(
  value: DbCredentialRequest
): CredentialChallengeStatus {
  let status: CredentialChallengeStatus = "pending";

  if (value.expiresAt < new Date()) {
    status = "expired";
  }

  if (!value.code) {
    status = "used";
  }

  return status;
}
