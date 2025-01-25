export type ClaimSchema = {
  validFrom: Date | undefined;
  validUntil: Date | undefined;
  claims: object;
};
