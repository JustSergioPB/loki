import { DbCredential } from "@/db/schema/credentials";
import {
  IdentifiedCredential,
  UnsignedCredential,
  VerifiableCredential,
} from "./verifiable-credential";

export const credentialStatus = [
  "empty",
  "pending",
  "identified",
  "signed",
] as const;
export type CredentialStatus = (typeof credentialStatus)[number];

export type EmptyCredentialSnapshot = Omit<DbCredential, "content"> & {
  content: null;
};

export type PendingCredentialSnapshot = Omit<DbCredential, "content"> & {
  content: UnsignedCredential;
};

export type IdentifiedCredentialSnapshot = Omit<DbCredential, "content"> & {
  content: IdentifiedCredential;
};

export type SignedCredentialSnapshot = Omit<DbCredential, "content"> & {
  content: VerifiableCredential;
};
