import { DbChallenge } from "@/db/schema/challenges";

export const challengeStatus = [
  "used",
  "expired",
  "pending",
] as const;
export type ChallengeStatus =
  (typeof challengeStatus)[number];

export type ChallengeSnapshot = Omit<DbChallenge, "code"> & {
  code: number;
};

export type BurnedChallengeSnapshot = Omit<DbChallenge, "code"> & {
  code: null;
};
