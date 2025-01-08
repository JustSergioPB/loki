import { DbDID } from "@/db/schema/dids";
import { DIDDocument, Service } from "./did-document";
import { Key } from "./key";

export type DIDProps = Omit<DbDID, "orgId" | "userId">;

export type CreateDIDProps = {
  did: string;
  keys: Key[];
};

export abstract class DID {
  protected _props: DIDProps;

  protected constructor(props: DIDProps) {
    this._props = props;
  }

  get props(): DIDProps {
    return this._props;
  }

  get signingLabel(): string {
    const signingLabel = this._props.document.assertionMethod[0];

    if (!signingLabel) {
      throw new Error("missingLabel");
    }

    return signingLabel;
  }

  protected static buildDocument(
    props: CreateDIDProps,
    url: string,
    services: Service[] = [],
    controllers: string[] = []
  ): DIDDocument {
    const assertionMethod: string[] = [];
    const authorization: string[] = [];

    const verificationMethods = props.keys.map((key) => {
      if (key.purpose === "signing") {
        assertionMethod.push(key.id);
      }

      if (key.purpose === "authorization") {
        authorization.push(key.id);
      }

      return {
        controller: [props.did, ...controllers],
        ...key,
      };
    });

    return {
      id: `${url}`,
      controller: props.did,
      verificationMethod: verificationMethods,
      assertionMethod,
      authorization: authorization.length > 0 ? authorization : undefined,
      service: [
        {
          type: "CredentialStatus",
          serviceEndpoint: `${url}/credential-status`,
        },
        {
          type: "KeyStatus",
          serviceEndpoint: `${url}/key-status`,
        },
        ...services,
      ],
    };
  }
}
