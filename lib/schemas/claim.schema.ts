export type ClaimSchema = {
  validFrom: Date | undefined;
  validUntil: Date | undefined;
  credentialSubject: object;
};
