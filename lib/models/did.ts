import { DbDID } from "@/db/schema/dids";

export const didRevocationReasons = [
  "keyCompromise",
  "affiliationChanged",
  "superseded",
  "cessationOfOperation",
  "privilegeWithdrawn",
  "hold",
  "weakAlgorithm",
] as const;

export type DIDRevocationReason = (typeof didRevocationReasons)[number];

export type DIDProps = Omit<DbDID, "orgId" | "userId">;

export class DID {
  private _props: DIDProps;

  private constructor(props: DIDProps) {
    this._props = props;
  }

  static create(
    did: string,
    privateKeyHashes: string[],
    metadata: object
  ): DID {
    return new DID({
      did,
      metadata,
      isActive: true,
      privateKeyHashes,
      createdAt: new Date(),
      updatedAt: null,
      revokedAt: null,
      revocationReason: null,
    });
  }

  static fromProps(props: DbDID): DID {
    return new DID(props);
  }

  revoke(reason: DIDRevocationReason): void {
    this._props = {
      ...this._props,
      revocationReason: reason,
      revokedAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
