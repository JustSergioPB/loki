export const didRevocationReasons = [
  "keyCompromise",
  "affiliationChanged",
  "superseded",
  "cessationOfOperation",
  "privilegeWithdrawn",
  "hold",
  "weakAlgorithm",
] as const;

export type DIDRevocationReason = (typeof didRevocationReasons)[number];

export type Service = {
  type: string;
  serviceEndpoint: string;
};

export type VerificationMethod = {
  id: string;
  controllers: string[];
  type: string;
  publicKeyMultibase: string;
  revoked?: Date;
  revocationReason?: DIDRevocationReason;
};

export type DIDDocument = {
  id: string;
  controller: string;
  verificationMethod: VerificationMethod[];
  assertionMethod: string[];
  authorization?: string[];
  service: Service[];
};
