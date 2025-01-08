import { DbDID } from "@/db/schema/dids";
import { CreateDIDProps, DID, DIDProps } from "./did";
import { Org } from "./org";

export class OrgDID extends DID {
  private constructor(props: DIDProps) {
    super(props);
  }

  static create(props: CreateDIDProps, rootDID: OrgDID, url: string): OrgDID {
    return new OrgDID({
      did: props.did,
      document: super.buildDocument(
        props,
        `${url}/did/${props.did}`,
        [
          {
            type: "Profile",
            serviceEndpoint: `${url}/did/${props.did}/profile`,
          },
        ],
        [rootDID.props.did]
      ),
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
    });
  }

  static createRoot(props: CreateDIDProps, rootOrg: Org, url: string): OrgDID {
    const orgURL = `${url}/orgs/${rootOrg.id}`;

    return new OrgDID({
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

  static fromProps(props: DbDID): OrgDID {
    return new OrgDID(props);
  }
}
