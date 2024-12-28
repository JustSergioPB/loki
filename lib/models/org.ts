import { Org as DbOrg } from "@/db/schema/orgs";

export type OrgProps = Omit<DbOrg, "id" | "publicId">;
export type OrgId = number | undefined;
export type OrgPublicId = string | undefined;

export class Org {
  private _props: OrgProps;
  public readonly id: OrgId;
  public readonly publicId: OrgPublicId;

  private constructor(props: OrgProps, id: OrgId, publicId: OrgPublicId) {
    this._props = props;
    this.id = id;
    this.publicId = publicId;
  }

  static create(data: { name: string }): Org {
    return new Org(
      {
        ...data,
        verifiedAt: null,
        createdAt: new Date(),
        updatedAt: null,
      },
      undefined,
      undefined
    );
  }

  static fromProps(data: DbOrg): Org {
    return new Org(data, data.id, data.publicId);
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
