import { DbDID } from "@/db/schema/dids";
import { CreateDIDProps, DID, DIDProps } from "./did";
import { Org } from "./org";

export class RootDID extends DID {
  private constructor(props: DIDProps) {
    super(props);
  }

  static create(props: CreateDIDProps, rootOrg: Org, url: string): RootDID {
    const orgURL = `${url}/orgs/${rootOrg.id}`;

    return new RootDID({
      did: props.did,
      document: super.buildDocument(props, orgURL, [
        {
          type: "VerifiedOrganizations",
          serviceEndpoint: `${orgURL}/organizations?status=verified`,
        },
      ]),
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
    });
  }

  static fromProps(props: DbDID): RootDID {
    return new RootDID(props);
  }
}
