import { DbDID } from "@/db/schema/dids";
import { CreateDIDProps, DID, DIDProps } from "./did";
import { Org } from "./org";
import { OrgDIDError } from "../errors/org-did.error";

export class OrgDID extends DID {
  private constructor(props: DIDProps) {
    super(props);
  }

  static create(
    props: CreateDIDProps,
    rootOrg: Org,
    org: Org,
    url: string
  ): OrgDID {
    const orgURL = `${url}/orgs/${org.id}`;

    if (!rootOrg.did) {
      throw new OrgDIDError("missingRootDID");
    }

    return new OrgDID({
      did: props.did,
      document: super.buildDocument(
        props,
        orgURL,
        [
          {
            type: "Issuers",
            serviceEndpoint: `${orgURL}/issuers`,
          },
        ],
        [rootOrg.did.props.did]
      ),
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
    });
  }

  static fromProps(props: DbDID): OrgDID {
    return new OrgDID(props);
  }
}
