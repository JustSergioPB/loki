import { DbFormVersion } from "@/db/schema/form-versions";
import { CredentialSchema } from "./credential-schema";

export const formVersionStatuses = ["draft", "published", "archived"] as const;
export type FormVersionStatus = (typeof formVersionStatuses)[number];

export type PublishedFormVersion = Omit<DbFormVersion, "content"> & {
  content: CredentialSchema;
};
