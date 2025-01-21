import { db } from "@/db";
import { eq } from "drizzle-orm";
import { privateKeyTable } from "@/db/schema/private-keys";
import { Key } from "@/lib/types/key";
import * as crypto from "crypto";
import { PREFFIX_MAP, SupportedPreffix } from "../types/encoding";
import { ALGORITHM_MAP, SupportedAlgorithm } from "../types/algorithms";
import { baseEncode } from "../helpers/encoder";

const CIPHER_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const PREFFIX: SupportedPreffix = "z";
const KEYGEN_ALGORITHM: SupportedAlgorithm = "ed25519";
const HASHING_ALGORITHM = "sha256";

export async function generateKeyPair(label: string): Promise<Key> {
  const keyPair = crypto.generateKeyPairSync(KEYGEN_ALGORITHM, {
    publicKeyEncoding: {
      type: "spki",
      format: "der",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: "aes-256-cbc",
      passphrase: process.env.PK_PASSPHRASE!,
    },
  });

  const base = PREFFIX_MAP[PREFFIX];

  await db
    .insert(privateKeyTable)
    .values({
      pem: keyPair.privateKey,
      label,
    })
    .returning();

  return {
    type: ALGORITHM_MAP[KEYGEN_ALGORITHM],
    publicKeyMultibase: `${PREFFIX}${baseEncode(
      keyPair.publicKey,
      base.base,
      base.alphabet
    )}`,
  };
}

export async function encrypt(label: string, message: string): Promise<string> {
  const [privateKey] = await db
    .select()
    .from(privateKeyTable)
    .where(eq(privateKeyTable.label, label));

  if (!privateKey) {
    throw new Error("keyNotFound");
  }

  const encryptionKey = crypto
    .createHash(HASHING_ALGORITHM)
    .update(privateKey.pem)
    .digest();

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(CIPHER_ALGORITHM, encryptionKey, iv);

  const encrypted = Buffer.concat([cipher.update(message), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const combinedContent = Buffer.concat([iv, authTag, encrypted]).toString(
    "base64"
  );

  return combinedContent;
}

export async function decrypt(
  label: string,
  encrypted: string
): Promise<string> {
  const [privateKey] = await db
    .select()
    .from(privateKeyTable)
    .where(eq(privateKeyTable.label, label));

  if (!privateKey) {
    throw new Error("keyNotFound");
  }

  const encryptionKey = crypto
    .createHash(HASHING_ALGORITHM)
    .update(privateKey.pem)
    .digest();

  const combinedBuffer = Buffer.from(encrypted, "base64");
  const iv = combinedBuffer.subarray(0, IV_LENGTH);
  const authTag = combinedBuffer.subarray(IV_LENGTH, IV_LENGTH + 16);
  const content = combinedBuffer.subarray(IV_LENGTH + 16);

  const decipher = crypto.createDecipheriv(CIPHER_ALGORITHM, encryptionKey, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(content), decipher.final()]);

  return JSON.parse(decrypted.toString());
}
