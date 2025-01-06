import { DbDID } from "@/db/schema/dids";
import { CreateDIDProps, DID, DIDProps } from "./did";
import { Org } from "./org";
import { User } from "./user";
import { UserDIDError } from "../errors/user-did.error";

export class UserDID extends DID {
  private constructor(props: DIDProps) {
    super(props);
  }

  static create(
    props: CreateDIDProps,
    org: Org,
    user: User,
    url: string
  ): UserDID {
    const userURL = `${url}/user/${user.id}`;
    const orgURL = `${url}/orgs/${org.id}`;

    if (!org.did) {
      throw new UserDIDError("missingOrgDID");
    }

    return new UserDID({
      did: props.did,
      document: super.buildDocument(
        props,
        userURL,
        [
          {
            type: "Organization",
            serviceEndpoint: orgURL,
          },
        ],
        [org.did.props.did]
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
