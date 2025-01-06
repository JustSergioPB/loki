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

  protected static buildDocument(
    props: CreateDIDProps,
    url: string,
    services: Service[] = [],
    controllers: string[] = []
  ): DIDDocument {
    const assertionMethod: string[] = [];
    const authorization: string[] = [];

    const verificationMethods = props.keys.map((key) => {
      const verificationMethodId = `${url}/keys/${key.id}`;

      if (key.purpose === "signing") {
        assertionMethod.push(verificationMethodId);
      }

      if (key.purpose === "authorization") {
        authorization.push(verificationMethodId);
      }

      return {
        id: verificationMethodId,
        controller: [props.did, ...controllers],
        publicKeyMultibase: key.publicKeyMultibase,
        type: key.type,
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
