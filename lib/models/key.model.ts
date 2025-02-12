import { db } from "@/db";
import { eq } from "drizzle-orm";
import { privateKeyTable } from "@/db/schema/private-keys";
import { Key } from "@/lib/types/key";
import * as crypto from "crypto";
import { PREFFIX_MAP, SupportedPreffix } from "../types/encoding";
import { TYPE_MAP } from "../types/algorithms";
import { baseEncode } from "../helpers/encoder";

const CIPHER_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const PREFFIX: SupportedPreffix = "z";
const KEYGEN_ALGORITHM = "ed25519";
const HASHING_ALGORITHM = "sha256";

export async function generateKeyPair(label: string): Promise<Key> {
  const keyPair = crypto.generateKeyPairSync("ed25519", {
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
    type: TYPE_MAP[KEYGEN_ALGORITHM],
    publicKeyMultibase: `${PREFFIX}${baseEncode(
      keyPair.publicKey,
      base.base,
      base.alphabet
    )}`,
  };
}

//TODO: solve this issue
export async function encrypt(label: string, message: string): Promise<string> {
  const [privateKey] = await db
    .select()
    .from(privateKeyTable)
    .where(eq(privateKeyTable.label, label));

  if (!privateKey) {
    throw new Error("keyNotFound");
  }

  const salt = crypto.randomBytes(16);

  const encryptionKey = crypto.pbkdf2Sync(
    crypto
      .createPrivateKey({
        key: privateKey.pem,
        format: "pem",
        passphrase: process.env.PK_PASSPHRASE!,
      })
      .export({ format: "pem", type: "pkcs8" }),
    salt,
    ITERATIONS,
    KEY_LENGTH,
    HASHING_ALGORITHM
  );

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(CIPHER_ALGORITHM, encryptionKey, iv);

  const encrypted = Buffer.concat([cipher.update(message), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${salt.toString(
    "hex"
  )}:${encrypted.toString("hex")}`;
}

//TODO: solve this issue
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

  const [iv, authTag, salt, content] = encrypted.split(":");

  const encryptionKey = crypto.pbkdf2Sync(
    crypto
      .createPrivateKey({
        key: privateKey.pem,
        format: "pem",
        passphrase: process.env.PK_PASSPHRASE!,
      })
      .export({ format: "pem", type: "pkcs8" }),
    Buffer.from(salt, "hex"),
    ITERATIONS,
    KEY_LENGTH,
    HASHING_ALGORITHM
  );

  const decipher = crypto.createDecipheriv(
    CIPHER_ALGORITHM,
    encryptionKey,
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(content, "hex")),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString());
}

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
