export const challengeErrorMessages = [
  "NOT_FOUND",
  "IS_BURNT",
  "IS_EXPIRED",
] as const;
export type ChallengeErrorMessage = (typeof challengeErrorMessages)[number];

export class ChallengeError extends Error {
  constructor(message: ChallengeErrorMessage) {
    super(message);
    this.name = message;
  }
}
