export const userTokenContexts = ["confirmation", "reset-password"] as const;
export type UserTokenContext = (typeof userTokenContexts)[number];
