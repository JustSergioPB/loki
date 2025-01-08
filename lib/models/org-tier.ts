export const orgTierTypes = [
  "unbound",
  "starter",
  "pro",
  "enterprise",
] as const;
export type OrgTierType = (typeof orgTierTypes)[number];

export type Tier = {
  type: OrgTierType;
  users: number;
  forms: number;
};

export const TIER_MAP: Record<OrgTierType, Tier> = {
  starter: { users: 5, forms: 10, type: "starter" },
  pro: { users: 20, forms: 50, type: "pro" },
  enterprise: { users: 100, forms: 100, type: "enterprise" },
  unbound: { users: 1000, forms: 1000, type: "unbound" },
};
