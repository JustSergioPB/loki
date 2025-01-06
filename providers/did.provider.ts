import { Org } from "@/lib/models/org";
import { User } from "@/lib/models/user";
import { FakeHSMProvider, KeyPairProvider } from "./key-pair.provider";
import { OrgDID } from "@/lib/models/org-did";
import { UserDID } from "@/lib/models/user-did";
import * as uuid from "uuid";

export abstract class DIDProvider {
  abstract generateOrgDID(rootOrg: Org, org: Org): Promise<OrgDID>;
  abstract generateUserDID(org: Org, user: User): Promise<UserDID>;
}

export class UuidDIDProvider extends DIDProvider {
  private keyPairProvider: KeyPairProvider;

  constructor() {
    super();
    this.keyPairProvider = new FakeHSMProvider();
  }

  async generateOrgDID(rootOrg: Org, org: Org): Promise<OrgDID> {
    const pubKey = await this.keyPairProvider.generate(org);
    const url = process.env.BASE_URL!;

    return OrgDID.create(
      {
        did: `did:uuid:${uuid.v7()}`,
        keys: [{ ...pubKey, purpose: "signing" }],
      },
      rootOrg,
      org,
      url
    );
  }

  async generateUserDID(org: Org, user: User): Promise<UserDID> {
    const pubKey = await this.keyPairProvider.generate(org);
    const url = process.env.BASE_URL!;

    return UserDID.create(
      {
        did: `did:uuid:${uuid.v7()}`,
        keys: [{ ...pubKey, purpose: "signing" }],
      },
      org,
      user,
      url
    );
  }
}
