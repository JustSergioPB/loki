import { DbOrg } from "@/db/schema/orgs";

export type OrgProps = Omit<DbOrg, "id">;
export type OrgId = string | undefined;
export type CreateOrgProps = Pick<DbOrg, "name" | "tier">;

export class Org {
  private _props: OrgProps;
  public readonly id: OrgId;

  private constructor(props: OrgProps, id: OrgId) {
    this._props = props;
    this.id = id;
  }

  static create(data: CreateOrgProps): Org {
    return new Org(
      {
        ...data,
        verifiedAt: null,
        createdAt: new Date(),
        updatedAt: null,
      },
      undefined
    );
  }

  static fromProps(data: DbOrg): Org {
    return new Org(data, data.id);
  }

  get props(): OrgProps {
    return this._props;
  }

  verify(): void {
    this._props = {
      ...this._props,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
