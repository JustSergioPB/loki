import * as crypto from "crypto";
import { ALGORITHM_MAP, SupportedType } from "../types/algorithms";
import { PREFFIX_MAP, SupportedPreffix } from "../types/encoding";
import { baseDecode } from "./encoder";
import { DIDDocument } from "../types/did";
import { KeyError } from "../errors/key.error";
import { SignatureSchema } from "../schemas/signature.schema";

export function validateSignature(
  holder: DIDDocument,
  signature: SignatureSchema,
  message: string
): boolean {
  const verificationMethod = holder.verificationMethod.find(
    (v) => v.id === signature.label
  );

  if (!verificationMethod) {
    throw new KeyError("MISSING_VERIFICATION_METHOD");
  }

  const { publicKeyMultibase, type, revoked } = verificationMethod;
  const preffix = publicKeyMultibase[0] as SupportedPreffix;
  const alg = type as SupportedType;

  if (revoked) {
    throw new KeyError("REVOKED");
  }

  if (!PREFFIX_MAP[preffix]) {
    throw new KeyError("UNSUPPORTED_MULTIBASE");
  }

  if (!ALGORITHM_MAP[alg]) {
    throw new KeyError("UNSUPPORTED_TYPE");
  }

  const base = PREFFIX_MAP[preffix];
  const key = baseDecode(publicKeyMultibase.slice(1), base.base, base.alphabet);

  return crypto.verify(
    ALGORITHM_MAP[alg],
    Buffer.from(message),
    crypto.createPublicKey({
      format: "der",
      type: "spki",
      key: Buffer.from(key),
    }),
    Buffer.from(signature.value, "base64")
  );
}
