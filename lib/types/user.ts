export const userRoles = ["admin", "org-admin", "issuer"] as const;
export type UserRole = (typeof userRoles)[number];

export const userStatuses = ["active", "inactive", "banned"] as const;
export type UserStatus = (typeof userStatuses)[number];
