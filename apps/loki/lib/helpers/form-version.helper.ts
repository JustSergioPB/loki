import { DbFormVersion } from "@/db/schema/form-versions";
import { FormVersionStatus, PublishedFormVersion } from "../types/form-version";

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

export function isPublished(
  value: DbFormVersion
): value is PublishedFormVersion {
  return value.credentialSchema !== null;
}
