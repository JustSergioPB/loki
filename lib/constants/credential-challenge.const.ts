import { StatusTagVariant } from "@/components/app/status-tag";
import { ChallengeStatus } from "@/lib/types/credential-challenge";

export const CHALLENGE_STATUS_VARIANTS: Record<
  ChallengeStatus,
  StatusTagVariant
> = {
  used: "success",
  expired: "error",
  pending: "warning",
};
