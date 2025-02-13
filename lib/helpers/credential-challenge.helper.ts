import { DbChallenge } from "@/db/schema/challenges";
import {
  BurnedChallengeSnapshot,
  ChallengeSnapshot,
  ChallengeStatus,
} from "../types/credential-challenge";

export function getChallengeStatus(value: DbChallenge): ChallengeStatus {
  let status: ChallengeStatus = "pending";

  if (value.expiresAt < new Date()) {
    status = "expired";
  }

  if (!value.code) {
    status = "used";
  }

  return status;
}

export function isBurned(value: DbChallenge): value is BurnedChallengeSnapshot {
  return value.code === null;
}

export function isExpired(value: DbChallenge): value is ChallengeSnapshot {
  return value.expiresAt < new Date();
}
