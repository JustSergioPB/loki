import { DbDID } from "@/db/schema/dids";
import { CreateDIDProps, DID, DIDProps } from "./did";
import { OrgDID } from "./org-did";

export class UserDID extends DID {
  private constructor(props: DIDProps) {
    super(props);
  }

  static create(props: CreateDIDProps, orgDID: OrgDID, url: string): UserDID {
    return new UserDID({
      did: props.did,
      document: super.buildDocument(
        props,
        `${url}/did/${props.did}`,
        [
          {
            type: "Organization",
            serviceEndpoint: `${url}/did/${orgDID.props.did}/profile`,
          },
        ],
        [orgDID.props.did]
      ),
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
    });
  }

  static fromProps(props: DbDID): UserDID {
    return new UserDID(props);
  }
}
