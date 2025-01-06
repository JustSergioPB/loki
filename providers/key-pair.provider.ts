import { db } from "@/db";
import { privateKeyTable } from "@/db/schema/private-keys";
import { OrgError } from "@/lib/errors/org.error";
import { Key } from "@/lib/models/key";
import { Org } from "@/lib/models/org";
import * as crypto from "crypto";

export abstract class KeyPairProvider {
  abstract generate(org: Org): Promise<Omit<Key, "purpose">>;
}

export class FakeHSMProvider extends KeyPairProvider {
  async generate(org: Org): Promise<Omit<Key, "purpose">> {
    if (!org.id) {
      throw new OrgError("nonRegistered");
    }
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

    const [{ id }] = await db
      .insert(privateKeyTable)
      .values({
        pem: keyPair.privateKey,
        orgId: org.id,
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
      id,
      type: "Ed25519VerificationKey2020",
      publicKeyMultibase: "m" + base64Encoded,
    };
  }
}
