import { DbCredential } from "@/db/schema/credentials";
import { VerifiableCredential } from "./verifiable-crendential";

export type PlainCredential = Omit<
  DbCredential,
  "iv" | "authTag" | "encryptedContent"
> & {
  plainCredential: VerifiableCredential;
};
