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

  static create(props: SchemaSchema): Schema {
    const version = SchemaVersion.create(props);
    return new Schema(
      {
        title: props.title,
        createdAt: new Date(),
        updatedAt: null,
      },
      undefined,
      [version]
    );
  }

  static fromProps(props: DbSchema): Schema {
    const versions = props.versions.map((v) => SchemaVersion.fromProps(v));
    return new Schema(props, props.id, versions);
  }

  get props(): SchemaProps {
    return this._props;
  }

  update(props: SchemaSchema): void {
    const latestVersion = this.getLatestVersion();

    if (latestVersion.props.status === "draft") {
      latestVersion.update(props);
    } else {
      const newVersion = SchemaVersion.create(props);
      this.versions.push(newVersion);
    }

    this._props = {
      ...this._props,
      title: props.title,
      updatedAt: new Date(),
    };
  }

  getLatestVersion(): SchemaVersion {
    return this.versions.sort(
      (a, b) => b.props.createdAt.getTime() - a.props.createdAt.getTime()
    )[0];
  }
}
