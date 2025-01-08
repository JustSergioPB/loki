import { DbFormVersion } from "@/db/schema/form-versions";
import { FormSchema } from "../schemas/form.schema";
import { FormVersionError } from "../errors/form-version.error";
import {
  CredentialSchema,
  CredentialSchemaProperties,
} from "./credential-schema";

export type FormVersionProps = Omit<DbFormVersion, "id" | "orgId" | "formId">;

export const formVersionStatuses = ["draft", "published", "archived"] as const;
export type FormVersionStatus = (typeof formVersionStatuses)[number];

export class FormVersion {
  private _props: FormVersionProps;
  public readonly id: string | undefined;

  private constructor(props: FormVersionProps, id?: string) {
    this._props = props;
    this.id = id;
  }

  get props(): FormVersionProps {
    return this._props;
  }

  get title(): string {
    return this._props.credentialSchema.title;
  }

  get description(): string | undefined {
    return this._props.credentialSchema.description;
  }

  get validFrom(): Date | undefined {
    const validFrom = this._props.credentialSchema.properties.validFrom?.const;
    return validFrom ? new Date(validFrom) : undefined;
  }

  get validUntil(): Date | undefined {
    const validUntil =
      this._props.credentialSchema.properties.validUntil?.const;
    return validUntil ? new Date(validUntil) : undefined;
  }

  get credentialSubject(): { [x: string]: unknown } {
    return this._props.credentialSchema.properties.credentialSubject.properties;
  }

  get proof(): { type: string; cryptosuite: string; proofPurpose: string } {
    return {
      type: this._props.credentialSchema.properties.proof.properties.type.const,
      cryptosuite:
        this._props.credentialSchema.properties.proof.properties.type.const,
      proofPurpose:
        this._props.credentialSchema.properties.proof.properties.proofPurpose
          .const,
    };
  }

  get credentialSchema(): { type: string } {
    return {
      type: this._props.credentialSchema.properties.credentialSchema.properties
        .type.const,
    };
  }

  get context(): string[] {
    return this._props.credentialSchema.properties["@context"].const;
  }

  get type(): string[] {
    return this._props.credentialSchema.properties.type.const;
  }

  static create(props: FormSchema): FormVersion {
    return new FormVersion(
      {
        credentialSchema: this.buildForm(props),
        createdAt: new Date(),
        updatedAt: null,
        status: "draft",
      },
      undefined
    );
  }

  static fromProps(props: DbFormVersion): FormVersion {
    return new FormVersion(props, props.id);
  }

  update(props: FormSchema): void {
    this._props.credentialSchema = FormVersion.buildForm(props);
    this._props.updatedAt = new Date();
  }

  publish(): void {
    if (this._props.status !== "draft") {
      throw new FormVersionError("cantBePublished");
    }
    this._props.status = "published";
    this._props.updatedAt = new Date();
  }

  archive(): void {
    if (this._props.status !== "published") {
      throw new FormVersionError("cantBeArchived");
    }
    this._props.status = "archived";
    this._props.updatedAt = new Date();
  }

  private static buildForm(props: FormSchema): CredentialSchema {
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
      type: { const: ["VerifiableCredential", ...props.type] },
      issuer: { type: "string", format: "uri" },
      id: { type: "string", format: "uri" },
      credentialSubject: {
        properties: {
          id: { type: "string", format: "uri" },
          ...props.content,
        },
        type: "object",
        required: ["id"],
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
            const: "Ed25519Signature2020",
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
