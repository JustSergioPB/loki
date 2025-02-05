import * as crypto from "crypto";
import { ALGORITHM_MAP, SupportedType } from "../types/algorithms";
import { PREFFIX_MAP, SupportedPreffix } from "../types/encoding";
import { baseDecode } from "./encoder";

export function verifySignature(
  publicKeyMultibase: string,
  publicKeyType: string,
  signature: string,
  message: string
): boolean {
  const preffix = publicKeyMultibase[0] as SupportedPreffix;
  const alg = publicKeyType as SupportedType;

  if (!PREFFIX_MAP[preffix]) {
    throw new Error("unsupportedPreffix");
  }

  if (!ALGORITHM_MAP[alg]) {
    throw new Error("unsupportedAlgorithm");
  }

  const base = PREFFIX_MAP[preffix];

  return crypto.verify(
    ALGORITHM_MAP[alg],
    Buffer.from(message),
    crypto.createPublicKey({
      format: "der",
      type: "spki",
      key: Buffer.from(
        baseDecode(publicKeyMultibase.slice(1), base.base, base.alphabet)
      ),
    }),
    Buffer.from(signature)
  );
}
