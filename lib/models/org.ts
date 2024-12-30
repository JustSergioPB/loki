import { Org as DbOrg } from "@/db/schema/orgs";
import { Address } from "./address";

export type OrgProps = Omit<DbOrg, "id" | "publicId">;
export type OrgId = number | undefined;
export type OrgPublicId = string | undefined;

export class Org {
  private _props: OrgProps;
  private _address: Address | undefined;
  public readonly id: OrgId;
  public readonly publicId: OrgPublicId;

  private constructor(
    props: OrgProps,
    id: OrgId,
    publicId: OrgPublicId,
    address?: Address
  ) {
    this._props = props;
    this.id = id;
    this.publicId = publicId;
    this._address = address;
  }

  static create(data: { name: string }): Org {
    return new Org(
      {
        ...data,
        verifiedAt: null,
        createdAt: new Date(),
        updatedAt: null,
        status: "onboarding",
      },
      undefined,
      undefined
    );
  }

  static fromProps(data: DbOrg, address?: Address): Org {
    return new Org(data, data.id, data.publicId, address);
  }

  get props(): OrgProps {
    return this._props;
  }

  get adress(): Address | undefined {
    return this._address;
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
}
