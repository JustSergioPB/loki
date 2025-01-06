import { db } from "@/db";
import { privateKeyTable } from "@/db/schema/private-keys";
import { Key } from "@/lib/models/key";
import * as crypto from "crypto";

export abstract class KeyPairProvider {
  abstract generate(label: string): Promise<Omit<Key, "purpose" | "id">>;
}

export class FakeHSMProvider extends KeyPairProvider {
  async generate(label: string): Promise<Omit<Key, "purpose" | "id">> {
    const keyPair = crypto.generateKeyPairSync("ed25519", {
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
        cipher: "aes-256-cbc",
        passphrase: process.env.PASSPHRASE!,
      },
    });

    await db
      .insert(privateKeyTable)
      .values({
        pem: keyPair.privateKey,
        label,
      })
      .returning();

    // Remove PEM header, footer, and any whitespace
    const cleanPem = keyPair.publicKey
      .replace("-----BEGIN PUBLIC KEY-----", "")
      .replace("-----END PUBLIC KEY-----", "")
      .replace(/\s/g, "");

    // Decode base64 PEM content to get the raw bytes
    const rawBytes = Buffer.from(cleanPem, "base64");

    // Skip the ASN.1 header for Ed25519 (if present)
    // Ed25519 ASN.1 header is typically 12 bytes
    const publicKeyBytes = Buffer.alloc(32); // Ed25519 public key is always 32 bytes
    rawBytes.copy(publicKeyBytes, 0, rawBytes.length - 32); // Copy last 32 bytes
    const base64Encoded = publicKeyBytes.toString("base64");

    return {
      type: "Ed25519VerificationKey2020",
      publicKeyMultibase: "m" + base64Encoded,
    };
  }
}
