import { DbOrg } from "@/db/schema/orgs";

export type OrgProps = Omit<DbOrg, "id">;
export type CreateOrgProps = Pick<DbOrg, "name" | "tier">;

export const orgStatus = ["onboarding", "verifying", "verified"] as const;
export type OrgStatus = (typeof orgStatus)[number];

export class Org {
  private _props: OrgProps;
  public readonly id: string | undefined;

  private constructor(props: OrgProps, id?: string) {
    this._props = props;
    this.id = id;
  }

  static create(props: CreateOrgProps): Org {
    return new Org({
      ...props,
      status: "verifying",
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: null,
    });
  }

  static fromProps(props: DbOrg): Org {
    return new Org(props, props.id);
  }

  get props(): OrgProps {
    return this._props;
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
