export const credentialStatus = ["empty", "unsigned", "signed"] as const;
export type CredentialStatus = (typeof credentialStatus)[number];
