import { db } from "@/db";
import { privateKeyTable } from "@/db/schema/private-keys";
import { OrgError } from "@/lib/errors/org.error";
import { Org } from "@/lib/models/org";
import { User } from "@/lib/models/user";
import * as crypto from "crypto";
import * as JOSE from "jose";

export type Key = {
  id: string;
  type: "Ed25519VerificationKey2020";
  publicKeyJwk: {
    kty: "OKP";
    crv: "Ed25519";
    x: string;
    alg: "EdDSA";
  };
};

export abstract class KeyPairProvider {
  abstract generate(org: Org, user?: User): Promise<Key>;
}

export class FakeHSMProvider extends KeyPairProvider {
  async generate(org: Org, user?: User): Promise<Key> {
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
        userId: user?.id,
      })
      .returning();

    const pubKey = await JOSE.importSPKI(keyPair.publicKey, "Ed25519");
    const publicKeyJwk = await JOSE.exportJWK(pubKey);

    return {
      id,
      type: "Ed25519VerificationKey2020",
      publicKeyJwk: {
        kty: "OKP",
        crv: "Ed25519",
        x: publicKeyJwk.x!,
        alg: "EdDSA",
      },
    };
  }
}
