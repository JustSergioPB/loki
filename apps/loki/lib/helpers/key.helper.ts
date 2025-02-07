import * as crypto from "crypto";
import { ALGORITHM_MAP, SupportedType } from "../types/algorithms";
import { PREFFIX_MAP, SupportedPreffix } from "../types/encoding";
import { baseDecode } from "./encoder";
import { DIDDocument } from "../types/did";
import { KeyError } from "../errors/key.error";
import { SignatureError } from "../errors/signature.error";

export function validateSignature(
  holder: DIDDocument,
  label: string,
  signature: string,
  message: string
): void {
  const verificationMethod = holder.verificationMethod.find(
    (v) => v.id === label
  );

  if (!verificationMethod) {
    throw new KeyError("missingVerificationMethod");
  }

  const { publicKeyMultibase, type, revoked } = verificationMethod;
  const preffix = publicKeyMultibase[0] as SupportedPreffix;
  const alg = type as SupportedType;

  if (revoked) {
    throw new KeyError("revoked");
  }

  if (!PREFFIX_MAP[preffix]) {
    throw new KeyError("unsupportedMultibase");
  }

  if (!ALGORITHM_MAP[alg]) {
    throw new KeyError("unsupportedType");
  }

  const base = PREFFIX_MAP[preffix];

  const isValid = crypto.verify(
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

  if (!isValid) {
    throw new SignatureError("invalid");
  }
}
