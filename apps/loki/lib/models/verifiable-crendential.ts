export type VerifiableCredential = {
  "@context": string[];
  type: string[];
  id: string;
  title: string;
  description: string | undefined;
  issuer: string;
  validFrom: string | undefined;
  validUntil: string | undefined;
  credentialSubject: {
    id: string;
    [x: string]: unknown;
  };
  credentialSchema: {
    id: string;
    type: string;
  };
  proof: {
    type: string;
    cryptosuite: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string | undefined;
  };
};
