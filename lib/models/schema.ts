import { Schema as DbSchema, SchemaWithVersions } from "@/db/schema/schemas";
import { SchemaSchema } from "../schemas/schema.schema";
import { SchemaVersion } from "./schema-version";

export type SchemaProps = Omit<DbSchema, "id" | "publicId" | "orgId">;
export type SchemaId = number | undefined;
export type SchemaPublicId = string | undefined;

export class Schema {
  private _props: SchemaProps;
  public readonly id: SchemaId;
  public readonly publicId: SchemaPublicId;
  public readonly versions: SchemaVersion[];

  private constructor(
    props: SchemaProps,
    id: SchemaId,
    publicId: SchemaPublicId,
    versions: SchemaVersion[]
  ) {
    this._props = props;
    this.id = id;
    this.publicId = publicId;
    this.versions = versions;
  }

  static create(data: SchemaSchema): Schema {
    const version = SchemaVersion.create(data);
    return new Schema(
      {
        title: data.title,
        createdAt: new Date(),
        updatedAt: null,
      },
      undefined,
      undefined,
      [version]
    );
  }

  static fromProps(data: SchemaWithVersions): Schema {
    const versions = data.versions.map((v) => SchemaVersion.fromProps(v));
    return new Schema(data, data.id, data.publicId, versions);
  }

  get props(): SchemaProps {
    return this._props;
  }

  update(data: SchemaSchema): void {
    const latestVersion = this.getLatestVersion();

    if (latestVersion.props.status === "draft") {
      latestVersion.update(data);
    } else {
      const newVersion = SchemaVersion.create(data);
      this.versions.push(newVersion);
    }

    this._props = {
      ...this._props,
      title: data.title,
      updatedAt: new Date(),
    };
  }

  getLatestVersion(): SchemaVersion {
    return this.versions.sort(
      (a, b) => b.props.createdAt.getTime() - a.props.createdAt.getTime()
    )[0];
  }
}
