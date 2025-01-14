export const keyPurposes = ["assertion", "authorization"] as const;
export type KeyPurpose = (typeof keyPurposes)[number];

export type Key = {
  type: string;
  publicKeyMultibase: string;
};
