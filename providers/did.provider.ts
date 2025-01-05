import { Org } from "@/lib/models/org";
import { User } from "@/lib/models/user";
import { KeyPairProvider } from "./key-pair.provider";
import { anchor, DID, PublicKey } from "@decentralized-identity/ion-tools";

export type DIDResult = { did: string; medata: object };

export abstract class DIDProvider {
  abstract generateOrgDID(org: Org): Promise<DIDResult>;
  abstract generateUserDID(org: Org, user: User): Promise<DIDResult>;
}

export class IONDIDProvider extends DIDProvider {
  private keyPairProvider: KeyPairProvider;

  constructor(keyPairProvider: KeyPairProvider) {
    super();
    this.keyPairProvider = keyPairProvider;
  }

  async generateOrgDID(org: Org): Promise<DIDResult> {
    const key = await this.keyPairProvider.generate(org);
    const pubKey = { ...key, purposes: ["assertion"] } as PublicKey;

    const did = new DID({
      content: {
        publicKeys: [pubKey],
        services: [],
      },
    });

    // Generate and publish create request to an ION node
    const createRequest = await did.generateRequest(0);
    await anchor(createRequest);
    // Store the key material and source data of all operations that have been created for the DID
    const ionOps = await did.getAllOperations();
    const uri = await did.getURI();

    return {
      did: uri,
      medata: ionOps,
    };
  }

  async generateUserDID(org: Org, user: User): Promise<DIDResult> {
    const key = await this.keyPairProvider.generate(org, user);
    const pubKey = { ...key, purposes: ["assertion"] };

    const did = new DID({
      content: {
        publicKeys: [pubKey],
        services: [],
      },
    });

    // Generate and publish create request to an ION node
    const createRequest = await did.generateRequest(0);
    await anchor(createRequest);
    // Store the key material and source data of all operations that have been created for the DID
    const ionOps = await did.getAllOperations();
    const uri = await did.getURI('short');

    return {
      did: uri,
      medata: ionOps,
    };
  }
}
