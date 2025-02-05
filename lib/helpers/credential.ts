import { DbCredential } from "@/db/schema/credentials";
import { CredentialStatus } from "../types/credential";

export default function getCredentialStatus(
  value: DbCredential
): CredentialStatus {
  let status: CredentialStatus = "empty";

  status =
    value.content && Object.hasOwn(value.content, "proof")
      ? "signed"
      : "pending";

  return status;
}
