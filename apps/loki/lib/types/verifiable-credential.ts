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

export type VerifiableCredentialSchema = {
  id: string;
  type: string;
};

export type VerifiableCredentialSubject = {
  id: string;
  [x: string]: unknown;
};

export type VerifiableCredential = {
  "@context": string[];
  type: string[];
  id: string;
  title: string;
  description?: string;
  issuer: VerifiableCredentialIssuer;
  validFrom?: string;
  validUntil?: string;
  credentialSubject: VerifiableCredentialSubject;
  credentialSchema: VerifiableCredentialSchema;
  proof: VerifiableCredentialProof;
};

export type FilledCredential = Omit<VerifiableCredential, "proof">;
