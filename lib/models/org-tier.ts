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
  schemas: number;
};

export const TIER_MAP: Record<OrgTierType, Tier> = {
  starter: { users: 5, schemas: 10, type: "starter" },
  pro: { users: 20, schemas: 50, type: "pro" },
  enterprise: { users: 100, schemas: 100, type: "enterprise" },
  unbound: { users: 1000, schemas: 1000, type: "unbound" },
};
