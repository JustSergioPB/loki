import { DbCredential } from "@/db/schema/credentials";
import { VerifiableCredential } from "./verifiable-crendential";
import { CredentialError } from "../errors/credential.error";

export type CredentialProps = Omit<
  DbCredential,
  "orgId" | "userId" | "id" | "formVersionId" | "formVersion"
>;

export type CreateCredentialProps = {
  iv: string;
  encryptedContent: string;
  authTag: string;
  holder: string;
};
export class Credential {
  public readonly id: string | undefined;
  private _props: CredentialProps;
  private _content: VerifiableCredential | undefined;

  private constructor(props: CredentialProps, id?: string) {
    this._props = props;
    this.id = id;
  }

  get props(): CredentialProps {
    return this._props;
  }

  get title(): string {
    if (!this._content) {
      throw new CredentialError("encrypted");
    }
    return this._content.title;
  }

  get type(): string[] {
    if (!this._content) {
      throw new CredentialError("encrypted");
    }
    return this._content.type;
  }

  get description(): string | undefined {
    if (!this._content) {
      throw new CredentialError("encrypted");
    }
    return this._content.description;
  }
  get context(): string[] {
    if (!this._content) {
      throw new CredentialError("encrypted");
    }
    return this._content["@context"];
  }

  get issuer(): string {
    if (!this._content) {
      throw new CredentialError("encrypted");
    }
    return this._content.issuer;
  }

  get validFrom(): Date | undefined {
    if (!this._content) {
      throw new CredentialError("encrypted");
    }
    const validFrom = this._content.validFrom;
    return validFrom ? new Date(validFrom) : undefined;
  }

  get validUntil(): Date | undefined {
    if (!this._content) {
      throw new CredentialError("encrypted");
    }
    const validUntil = this._content.validUntil;
    return validUntil ? new Date(validUntil) : undefined;
  }

  get credentialSubject(): {
    id: string;
    [x: string]: unknown;
  } {
    if (!this._content) {
      throw new CredentialError("encrypted");
    }
    return this._content.credentialSubject;
  }

  get credentialSchema(): {
    id: string;
    type: string;
  } {
    if (!this._content) {
      throw new CredentialError("encrypted");
    }
    return this._content.credentialSchema;
  }

  get proof(): {
    type: string;
    cryptosuite: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string | undefined;
  } {
    if (!this._content) {
      throw new CredentialError("encrypted");
    }
    return this._content.proof;
  }

  static create(props: CreateCredentialProps): Credential {
    return new Credential({
      ...props,
      createdAt: new Date(),
      updatedAt: null,
    });
  }

  static fromProps(props: DbCredential): Credential {
    return new Credential(props, props.id);
  }

  addDecrypted(content: VerifiableCredential): void {
    this._content = content;
  }
}
