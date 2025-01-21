export type VerifiableCredentialProof = {
  type: string;
  cryptosuite: string;
  created: string;
  verificationMethod: string;
  proofPurpose: string;
  proofValue: string;
};

export type VerifiableCredentialIssuer = {
  id: string;
  name: string;
};

export type VerifiableCredential = {
  "@context": string[];
  type: string[];
  id: string;
  title: string;
  description: string | undefined;
  issuer: VerifiableCredentialIssuer;
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
  proof: VerifiableCredentialProof;
};

export type SigningVerifiableCredential = Omit<
  VerifiableCredential,
  "proof"
> & {
  proof: Partial<VerifiableCredentialProof>;
};

export type UnsignedVerifiableCredential = Omit<
  VerifiableCredential,
  "proof" | "credentialSubject"
> & {
  credentialSubject: {
    [x: string]: unknown;
  };
};
