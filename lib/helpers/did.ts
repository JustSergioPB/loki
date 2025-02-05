import { DbDID } from "@/db/schema/dids";

export function didIsActive(value: DbDID): boolean {
  return value.document.verificationMethod.some((vm) => !vm.revoked);
}
