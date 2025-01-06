import { DbOrg } from "@/db/schema/orgs";
import { OrgDID } from "./org-did";

export type OrgProps = Omit<DbOrg, "id">;
export type CreateOrgProps = Pick<DbOrg, "name" | "tier">;

export const orgStatus = ["onboarding", "verifying", "verified"] as const;
export type OrgStatus = (typeof orgStatus)[number];

export class Org {
  private _props: OrgProps;
  private _did: OrgDID | undefined;
  public readonly id: string | undefined;

  private constructor(props: OrgProps, id?: string, did?: OrgDID) {
    this._props = props;
    this.id = id;
    this._did = did;
  }

  static create(props: CreateOrgProps): Org {
    return new Org({
      ...props,
      status: "onboarding",
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: null,
    });
  }

  static fromProps(props: DbOrg): Org {
    const did = props.did ? OrgDID.fromProps(props.did) : undefined;
    return new Org(props, props.id, did);
  }

  get props(): OrgProps {
    return this._props;
  }

  get did(): OrgDID | undefined {
    return this._did;
  }

  verify(did: OrgDID): void {
    this._did = did;
    this._props = {
      ...this._props,
      status: "verified",
      verifiedAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
