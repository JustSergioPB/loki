export const supportedAlgorithms = ["ed25519", "SHA256"] as const;
export type SupportedAlgorithm = (typeof supportedAlgorithms)[number];
export const supportedTypes = [
  "Ed25519VerificationKey2020",
  "P256Key2021",
] as const;
export type SupportedType = (typeof supportedTypes)[number];

export const ALGORITHM_MAP: Record<SupportedType, SupportedAlgorithm> = {
  Ed25519VerificationKey2020: "ed25519",
  P256Key2021: "SHA256",
};

export const TYPE_MAP: Record<SupportedAlgorithm, SupportedType> = {
  ed25519: "Ed25519VerificationKey2020",
  SHA256: "P256Key2021",
};
