import { StatusTagVariant } from "@/components/app/status-tag";
import { CredentialChallengeStatus } from "@/lib/types/credential-challenge";

export const CHALLENGE_STATUS_VARIANTS: Record<
  CredentialChallengeStatus,
  StatusTagVariant
> = {
  used: "success",
  expired: "error",
  pending: "warning",
};
