import { db } from "@/db";
import { eq } from "drizzle-orm";
import { privateKeyTable } from "@/db/schema/private-keys";
import { Key } from "@/lib/models/key";
import * as crypto from "crypto";
import * as canonicalize from "json-canonicalize";
import { Credential } from "@/lib/models/credential";
import { DbCredential } from "@/db/schema/credentials";
import { VerifiableCredential } from "@/lib/models/verifiable-crendential";

export abstract class KeyPairProvider {
  abstract generate(label: string): Promise<Omit<Key, "purpose" | "id">>;
  abstract signAndEncrypt(
    label: string,
    verifiableCredential: VerifiableCredential
  ): Promise<Credential>;
  abstract decrypt(
    label: string,
    credential: DbCredential
  ): Promise<Credential>;
}

export class FakeHSMProvider extends KeyPairProvider {
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly IV_LENGTH = 12;
  private static readonly AUTH_TAG_LENGTH = 16;

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

  async signAndEncrypt(
    label: string,
    verifiableCredential: VerifiableCredential
  ): Promise<Credential> {
    const [privateKey] = await db
      .select()
      .from(privateKeyTable)
      .where(eq(privateKeyTable.label, label));

    if (!privateKey) {
      throw new Error("keyNotFound");
    }

    const key = crypto.createPrivateKey({
      type: "pkcs8",
      format: "pem",
      key: privateKey.pem,
      passphrase: process.env.PASSPHRASE!,
    });

    const unsigned = canonicalize.canonicalize(verifiableCredential);
    const signature = crypto.sign(null, Buffer.from(unsigned), key);

    verifiableCredential.proof.proofValue = signature.toString("base64");

    // Generate encryption key from private key
    const encryptionKey = crypto
      .createHash("sha256")
      .update(privateKey.pem)
      .digest();

    const iv = crypto.randomBytes(FakeHSMProvider.IV_LENGTH);
    const cipher = crypto.createCipheriv(
      FakeHSMProvider.ALGORITHM,
      encryptionKey,
      iv
    );

    const signed = JSON.stringify(verifiableCredential);
    const encrypted = Buffer.concat([cipher.update(signed), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return Credential.create({
      holder: verifiableCredential.credentialSubject.id,
      encryptedContent: encrypted.toString("base64"),
      iv: iv.toString("base64"),
      authTag: authTag.toString("base64"),
    });
  }

  async decrypt(
    label: string,
    dbCredential: DbCredential
  ): Promise<Credential> {
    const [privateKey] = await db
      .select()
      .from(privateKeyTable)
      .where(eq(privateKeyTable.label, label));

    if (!privateKey) {
      throw new Error("keyNotFound");
    }

    // Generate encryption key from private key
    const encryptionKey = crypto
      .createHash("sha256")
      .update(privateKey.pem)
      .digest();

    const credential = Credential.fromProps(dbCredential);

    const iv = Buffer.from(credential.props.iv, "base64");
    const authTag = Buffer.from(credential.props.authTag, "base64");
    const encrypted = Buffer.from(credential.props.encryptedContent, "base64");

    const decipher = crypto.createDecipheriv(
      FakeHSMProvider.ALGORITHM,
      encryptionKey,
      iv
    );

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    const verifiableCredential: VerifiableCredential = JSON.parse(
      decrypted.toString()
    );

    credential.addDecrypted(verifiableCredential);

    return credential;
  }
}
