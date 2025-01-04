import { DbSchema } from "@/db/schema/schemas";
import { SchemaSchema } from "../schemas/schema.schema";
import { SchemaVersion } from "./schema-version";

export type SchemaProps = Omit<DbSchema, "id" | "orgId" | "versions">;
export type SchemaId = string | undefined;

export class Schema {
  private _props: SchemaProps;
  public readonly id: SchemaId;
  public readonly versions: SchemaVersion[];

  private constructor(
    props: SchemaProps,
    id: SchemaId,
    versions: SchemaVersion[]
  ) {
    this._props = props;
    this.id = id;
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
      [version]
    );
  }

  static fromProps(data: DbSchema): Schema {
    const versions = data.versions.map((v) => SchemaVersion.fromProps(v));
    return new Schema(data, data.id, versions);
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
