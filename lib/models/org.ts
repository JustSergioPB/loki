import { Org as DbOrg } from "@/db/schema/orgs";
import { Address } from "./address";
import { User } from "./user";
import { OrgError } from "../errors/org.error";
import { Certificate } from "./certificate";

export type OrgProps = Omit<DbOrg, "id" | "publicId">;
export type CreateOrgProps = { name: string };
export type OrgId = number | undefined;

export class Org {
  private _props: OrgProps;
  private _address: Address | null;
  private _certificates: Certificate[];
  private _users: User[];
  public readonly id: OrgId;

  private constructor(
    props: OrgProps,
    certificates: Certificate[],
    users: User[],
    address: Address | null,
    id: OrgId
  ) {
    this._props = props;
    this.id = id;
    this._address = address;
    this._certificates = certificates;
    this._users = users;
  }

  static create(props: CreateOrgProps): Org {
    return new Org(
      {
        ...props,
        verifiedAt: null,
        createdAt: new Date(),
        updatedAt: null,
        status: "onboarding",
      },
      [],
      [],
      null,
      undefined
    );
  }

  static fromProps(props: DbOrg): Org {
    const {
      address: addressProps,
      certificates: certificateProps,
      users: userProps,
      id,
      ...rest
    } = props;

    const address = addressProps ? Address.fromProps(addressProps) : null;
    const certificates = certificateProps
      ? certificateProps.map((certProps) => Certificate.fromProps(certProps))
      : [];
    const users = userProps
      ? userProps.map((userProps) => User.fromProps(userProps))
      : [];

    return new Org(rest, certificates, users, address, id);
  }

  get props(): OrgProps {
    return this._props;
  }

  get adress(): Address | null {
    return this._address;
  }

  get certificates(): Certificate[] {
    return this._certificates;
  }

  addAddress(address: Address): void {
    this._address = address;
    this._props = {
      ...this._props,
      status: "verifying",
      updatedAt: new Date(),
    };
  }

  verify(): void {
    this._props = {
      ...this._props,
      status: "verified",
      verifiedAt: new Date(),
      updatedAt: new Date(),
    };
  }

  generateCertificateChain(): void {
    if (!this._address) {
      throw new OrgError("missingAddress");
    }

    if (!this._users.length) {
      throw new OrgError("missingUsers");
    }
  }
}
