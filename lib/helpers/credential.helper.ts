import { DbCredential } from "@/db/schema/credentials";
import {
  CredentialStatus,
  EmptyCredentialSnapshot,
  IdentifiedCredentialSnapshot,
  PendingCredentialSnapshot,
  SignedCredentialSnapshot,
} from "../types/credential";

export function getCredentialStatus(value: DbCredential): CredentialStatus {
  let status: CredentialStatus = "empty";

  status =
    value.content && Object.hasOwn(value.content, "proof")
      ? "signed"
      : "pending";

  return status;
}

export function isEmpty(value: DbCredential): value is EmptyCredentialSnapshot {
  return value.content === null;
}

export function isUnsigned(
  value: DbCredential
): value is PendingCredentialSnapshot {
  return (
    value.content !== null &&
    !Object.hasOwn(value, "id") &&
    !Object.hasOwn(value, "proof")
  );
}

export function isIdentified(
  value: DbCredential
): value is IdentifiedCredentialSnapshot {
  return (
    value.content !== null &&
    Object.hasOwn(value, "id") &&
    !Object.hasOwn(value, "proof")
  );
}

export function isSigned(
  value: DbCredential
): value is SignedCredentialSnapshot {
  return value.content !== null && Object.hasOwn(value, "proof");
}
