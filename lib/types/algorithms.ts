export const supportedAlgorithms = ["ed25519"] as const;
export type SupportedAlgorithm = (typeof supportedAlgorithms)[number];
export const supportedTypes = ["Ed25519VerificationKey2020"] as const;
export type SupportedType = (typeof supportedTypes)[number];

export const ALGORITHM_MAP: Record<SupportedAlgorithm, SupportedType> = {
  ed25519: "Ed25519VerificationKey2020",
};
