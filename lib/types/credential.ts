import { DbCredential } from "@/db/schema/credentials";
import { VerifiableCredential } from "./verifiable-crendential";

export type PlainCredential = Omit<DbCredential, "encryptedContent"> & {
  plainCredential: VerifiableCredential;
};

export const credentialStatus = [
  "not-filled",
  "pending",
  "signed",
  "claimed",
] as const;
export type CredentialStatus = (typeof credentialStatus)[number];
