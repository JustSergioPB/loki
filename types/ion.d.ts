declare module "@decentralized-identity/ion-tools" {
  export interface JWK {
    kty: string;
    crv: string;
    x: string;
    [key: string]: unknown;
  }

  export interface KeyPair {
    publicJwk: JWK;
    privateJwk: JWK;
  }

  export interface PublicKey {
    id: string;
    type: string;
    publicKeyJwk: JWK;
    purposes: string[];
  }

  export interface Service {
    id: string;
    type: string;
    serviceEndpoint: string;
  }

  export interface DIDContent {
    publicKeys?: PublicKey[];
    services?: Service[];
  }

  export interface DIDOptions {
    content: DIDContent;
  }

  export class DID {
    constructor(options: DIDOptions);
    generateRequest(version: number): Promise<unknown>;
    getAllOperations(): Promise<unknown[]>;
    getURI(format?: 'short'): Promise<string>;
  }

  export function generateKeyPair(): Promise<KeyPair>;
  export function anchor(request: unknown): Promise<unknown>;
}
