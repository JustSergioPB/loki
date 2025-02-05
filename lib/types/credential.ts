import { DbCredential } from "@/db/schema/credentials";
import { VerifiableCredential } from "./verifiable-crendential";

export type PlainCredential = Omit<DbCredential, "encryptedContent"> & {
  plainCredential: VerifiableCredential;
};

export const credentialStatus = [
  "empty",
  "pending",
  "signed",
  "claimed",
] as const;
export type CredentialStatus = (typeof credentialStatus)[number];
