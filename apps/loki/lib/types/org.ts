export const orgStatus = ["onboarding", "verifying", "verified"] as const;
export type OrgStatus = (typeof orgStatus)[number];

export const orgTiers = ["unbound", "starter", "pro", "enterprise"] as const;
export type OrgTier = (typeof orgTiers)[number];

export type Tier = {
  type: OrgTier;
  users: number;
  forms: number;
};

export const TIER_MAP: Record<OrgTier, Tier> = {
  starter: { users: 5, forms: 10, type: "starter" },
  pro: { users: 20, forms: 50, type: "pro" },
  enterprise: { users: 100, forms: 100, type: "enterprise" },
  unbound: { users: 1000, forms: 1000, type: "unbound" },
};
