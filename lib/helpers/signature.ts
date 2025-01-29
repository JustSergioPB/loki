import * as crypto from "crypto";
import { ALGORITHM_MAP, SupportedType } from "../types/algorithms";
import { PREFFIX_MAP, SupportedPreffix } from "../types/encoding";
import { baseDecode } from "./encoder";
import { privateKeyTable } from "@/db/schema/private-keys";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export async function getSignature(
  label: string,
  message: string
): Promise<string> {
  const [privateKey] = await db
    .select()
    .from(privateKeyTable)
    .where(eq(privateKeyTable.label, label));

  if (!privateKey) {
    throw new Error("privateKeyNotFound");
  }

  const key = crypto.createPrivateKey({
    type: "pkcs8",
    format: "pem",
    key: privateKey.pem,
    passphrase: process.env.PK_PASSPHRASE!,
  });

  return crypto.sign(null, Buffer.from(message), key).toString("base64");
}

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
