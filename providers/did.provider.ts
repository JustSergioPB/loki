import { Org } from "@/lib/models/org";
import { KeyPairProvider } from "./key-pair.provider";
import { OrgDID } from "@/lib/models/org-did";
import { UserDID } from "@/lib/models/user-did";
import * as uuid from "uuid";
export abstract class DIDProvider {
  abstract generateRootDID(rootOrg: Org): Promise<OrgDID>;
  abstract generateOrgDID(rootDID: OrgDID): Promise<OrgDID>;
  abstract generateUserDID(orgDID: OrgDID): Promise<UserDID>;
}

export class UuidDIDProvider extends DIDProvider {
  private keyPairProvider: KeyPairProvider;
  private baseUrl: string;

  constructor(keyPairProvider: KeyPairProvider, baseUrl: string) {
    super();
    this.keyPairProvider = keyPairProvider;
    this.baseUrl = baseUrl;
  }

  async generateRootDID(rootOrg: Org): Promise<OrgDID> {
    const did = `did:uuid:${uuid.v7()}`;
    const pubKey = await this.keyPairProvider.generate(`${did}#key-1`);

    return OrgDID.createRoot(
      {
        did,
        keys: [{ ...pubKey, purpose: "signing", id: `${did}#key-1` }],
      },
      rootOrg,
      this.baseUrl
    );
  }

  async generateOrgDID(rootDID: OrgDID): Promise<OrgDID> {
    const did = `did:uuid:${uuid.v7()}`;
    const pubKey = await this.keyPairProvider.generate(`${did}#key-1`);

    return OrgDID.create(
      {
        did,
        keys: [{ ...pubKey, purpose: "signing", id: `${did}#key-1` }],
      },
      rootDID,
      this.baseUrl
    );
  }

  async generateUserDID(orgDID: OrgDID): Promise<UserDID> {
    const did = `did:uuid:${uuid.v7()}`;
    const pubKey = await this.keyPairProvider.generate(`${did}#key-1`);

    return UserDID.create(
      {
        did: `did:uuid:${uuid.v7()}`,
        keys: [{ ...pubKey, purpose: "signing", id: `${did}#key-1` }],
      },
      orgDID,
      this.baseUrl
    );
  }
}
