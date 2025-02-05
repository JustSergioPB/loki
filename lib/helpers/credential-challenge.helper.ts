import { DbCredentialRequest } from "@/db/schema/credential-requests";
import {
  BurnedChallengeSnapshot,
  ChallengeSnapshot,
  CredentialChallengeStatus,
} from "../types/credential-challenge";

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

export function isBurned(
  value: DbCredentialRequest
): value is BurnedChallengeSnapshot {
  return value.code === null;
}

export function isExpired(
  value: DbCredentialRequest
): value is ChallengeSnapshot {
  return value.expiresAt < new Date();
}
