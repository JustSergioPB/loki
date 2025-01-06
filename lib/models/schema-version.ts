import { DbSchemaVersion } from "@/db/schema/schema-versions";
import { SchemaSchema } from "../schemas/schema.schema";
import { SchemaVersionError } from "../errors/schema-version.error";
import {
  CredentialSchema,
  CredentialSchemaProperties,
} from "./credential-schema";

export type SchemaVersionProps = Omit<
  DbSchemaVersion,
  "id" | "orgId" | "schemaId"
>;
export type SchemaVersionId = string | undefined;

export const schemaVersionStatuses = [
  "draft",
  "published",
  "archived",
] as const;
export type SchemaVersionStatus = (typeof schemaVersionStatuses)[number];

export class SchemaVersion {
  private _props: SchemaVersionProps;
  public readonly id: SchemaVersionId;

  private constructor(props: SchemaVersionProps, id: SchemaVersionId) {
    this._props = props;
    this.id = id;
  }

  static create(props: SchemaSchema): SchemaVersion {
    return new SchemaVersion(
      {
        content: this.buildSchema(props),
        createdAt: new Date(),
        updatedAt: null,
        status: "draft",
      },
      undefined
    );
  }

  static fromProps(props: DbSchemaVersion): SchemaVersion {
    const { content, ...rest } = props;
    return new SchemaVersion(
      { ...rest, content: content as CredentialSchema },
      props.id
    );
  }

  get props(): SchemaVersionProps {
    return this._props;
  }

  get description(): string | undefined {
    return this._props.content.description;
  }

  get validFrom(): Date | undefined {
    const validFrom = this._props.content.properties.validFrom?.const;
    return validFrom ? new Date(validFrom) : undefined;
  }

  get validUntil(): Date | undefined {
    const validUntil = this._props.content.properties.validUntil?.const;
    return validUntil ? new Date(validUntil) : undefined;
  }

  get credentialSubject(): object {
    return this._props.content.properties.credentialSubject.properties.content;
  }

  update(props: SchemaSchema): void {
    this._props.content = SchemaVersion.buildSchema(props);
    this._props.updatedAt = new Date();
  }

  publish(): void {
    if (this._props.status !== "draft") {
      throw new SchemaVersionError("cantBePublished");
    }
    this._props.status = "published";
    this._props.updatedAt = new Date();
  }

  archive(): void {
    if (this._props.status !== "published") {
      throw new SchemaVersionError("cantBeArchived");
    }
    this._props.status = "archived";
    this._props.updatedAt = new Date();
  }

  private static buildSchema(props: SchemaSchema): CredentialSchema {
    const required = [
      "@context",
      "title",
      "type",
      "issuer",
      "credentialSubject",
      "credentialSchema",
    ];

    const properties: CredentialSchemaProperties = {
      "@context": { const: ["https://www.w3.org/ns/credentials/v2"] },
      title: { const: props.title },
      type: { const: ["VerifiableCredential"] },
      issuer: { type: "string", format: "did" },
      id: { type: "string", format: "uuid" },
      credentialSubject: {
        properties: {
          id: { type: "string", format: "did" },
          content: props.content,
        },
        type: "object",
        required: ["id", "content"],
      },
      credentialSchema: {
        type: "object",
        properties: {
          id: { type: "string", format: "uri" },
          type: { const: "JsonSchema" },
        },
        required: ["id", "type"],
      },
      proof: {
        properties: {
          type: {
            const: "DataIntegrityProof",
          },
          cryptosuite: {
            const: "ecdsa-jcs-2022",
          },
          created: {
            type: "string",
            format: "datetime",
          },
          verificationMethod: {
            type: "string",
            format: "uri",
          },
          proofPurpose: {
            const: "assertionMethod",
          },
          proofValue: {
            type: "string",
          },
        },
        required: [
          "type",
          "cryptosuite",
          "created",
          "verificationMethod",
          "proofPurpose",
          "proofValue",
        ],
        type: "object",
      },
    };

    if (props.validFrom) {
      required.push("validFrom");
      properties.validFrom = { const: props.validFrom.toISOString() };
    }

    if (props.validUntil) {
      required.push("validUntil");
      properties.validUntil = { const: props.validUntil.toISOString() };
    }

    if (props.description) {
      required.push("description");
      properties.description = { const: props.description };
    }

    return {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: props.title,
      description: props.description,
      properties,
      required,
      type: "object",
    };
  }
}
