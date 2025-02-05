import { StatusTagVariant } from "@/components/app/status-tag";
import { CredentialStatus } from "@/lib/types/credential";

export const CREDENTIAL_STATUS_VARIANTS: Record<
  CredentialStatus,
  StatusTagVariant
> = {
  empty: "inactive",
  pending: "warning",
  signed: "success",
  identified: "secondary",
};
