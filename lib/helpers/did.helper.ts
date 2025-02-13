import { DbDID } from "@/db/schema/dids";
import { VerificationMethod } from "../types/did";
import { DidError } from "../errors/did.error";

export function didIsActive(value: DbDID): boolean {
  return value.document.verificationMethod.some((vm) => !vm.revoked);
}

export function getSigningMethod(value: DbDID): VerificationMethod {
  const verificationMethod = value.document.verificationMethod.find(
    (vm) => vm.id === value.document.assertionMethod[0]
  );

  if (!verificationMethod) {
    throw new DidError("ASSERTION_METHOD_NOT_FOUND");
  }

  return verificationMethod;
}
