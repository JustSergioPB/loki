export const supportedPreffix = ["u", "z"] as const;
export type SupportedPreffix = (typeof supportedPreffix)[number];
export const PREFFIX_MAP: Record<
  SupportedPreffix,
  { base: number; alphabet: string; name: string }
> = {
  u: {
    name: "base-64-url-no-pad",
    base: 64,
    alphabet:
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
  },
  z: {
    name: "base-58-btc",
    base: 58,
    alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
  },
};
