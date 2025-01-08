import { DbForm } from "@/db/schema/forms";
import { FormSchema } from "../schemas/form.schema";
import { FormVersion } from "./form-version";
import { DID } from "./did";
import { FormError } from "../errors/form.error";
import { VerifiableCredential } from "./verifiable-crendential";

export type FormProps = Omit<DbForm, "id" | "orgId" | "versions">;
export type FormId = string | undefined;

export type FillContent = {
  id: string;
  claims: object;
  validFrom: Date | undefined;
  validUntil: Date | undefined;
};

export class Form {
  private _props: FormProps;
  public readonly id: FormId;
  public readonly versions: FormVersion[];

  private constructor(props: FormProps, id: FormId, versions: FormVersion[]) {
    this._props = props;
    this.id = id;
    this.versions = versions;
  }

  get props(): FormProps {
    return this._props;
  }

  get latestVersion(): FormVersion {
    return this.versions.sort(
      (a, b) => b.props.createdAt.getTime() - a.props.createdAt.getTime()
    )[0];
  }

  get publishedVersion(): FormVersion | undefined {
    return this.versions
      .sort((a, b) => b.props.createdAt.getTime() - a.props.createdAt.getTime())
      .find((sv) => sv.props.status === "published");
  }

  static create(props: FormSchema): Form {
    const version = FormVersion.create(props);
    return new Form(
      {
        title: props.title,
        createdAt: new Date(),
        updatedAt: null,
      },
      undefined,
      [version]
    );
  }

  static fromProps(props: DbForm): Form {
    const versions = props.versions.map((v) => FormVersion.fromProps(v));
    return new Form(props, props.id, versions);
  }

  update(props: FormSchema): void {
    const latestVersion = this.latestVersion;

    if (latestVersion.props.status === "draft") {
      latestVersion.update(props);
    } else {
      const newVersion = FormVersion.create(props);
      this.versions.push(newVersion);
    }

    this._props = {
      ...this._props,
      title: props.title,
      updatedAt: new Date(),
    };
  }

  fill(
    content: FillContent,
    url: string,
    issuer: DID,
    holder: DID
  ): VerifiableCredential {
    const publishedVersion = this.publishedVersion;

    if (!publishedVersion) {
      throw new FormError("missingPublishedVersion");
    }

    return {
      "@context": publishedVersion.context,
      type: publishedVersion.type,
      id: content.id,
      title: publishedVersion.title,
      description: publishedVersion.description,
      issuer: issuer.props.did,
      validFrom:
        publishedVersion.validUntil?.toISOString() ??
        content.validFrom?.toISOString(),
      validUntil:
        publishedVersion.validUntil?.toISOString() ??
        content.validUntil?.toISOString(),
      credentialSubject: {
        id: holder.props.did,
        ...content.claims,
      },
      credentialSchema: {
        id: `${url}/forms/${this.id}/versions/${publishedVersion.id}`,
        type: publishedVersion.credentialSchema.type,
      },
      proof: {
        type: publishedVersion.proof.type,
        cryptosuite: publishedVersion.proof.cryptosuite,
        created: new Date().toISOString(),
        verificationMethod: issuer.props.document.assertionMethod[0],
        proofPurpose: publishedVersion.proof.proofPurpose,
        proofValue: undefined,
      },
    };
  }
}
