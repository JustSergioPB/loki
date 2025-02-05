import { DbFormVersion } from "@/db/schema/form-versions";
import { FormVersionStatus } from "../types/form-version";

export function getFormVersionStatus(value: DbFormVersion): FormVersionStatus {
  let status: FormVersionStatus = "draft";

  if (value.credentialSchema) {
    status = "published";
  }

  if (value.isArchived) {
    status = "archived";
  }

  return status;
}
