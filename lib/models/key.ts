export const keyPurposes = ["signing", "authorization"] as const;
export type KeyPurpose = (typeof keyPurposes)[number];

export type Key = {
  type: string;
  publicKeyMultibase: string;
  id: string;
  purpose: KeyPurpose;
};
