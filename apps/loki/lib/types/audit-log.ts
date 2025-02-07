export const auditActions = ["create", "update", "delete"] as const;
export type AuditAction = (typeof auditActions)[number];

export const auditableEntities = [
  "org",
  "user",
  "delegation-proof",
  "root-did",
  "org-did",
  "user-did",
  "did",
  "formVersion",
  "privateKey",
  "credential",
  "credentialRequest",
  "email-bridge",
] as const;
export type AuditableEntity = (typeof auditableEntities)[number];
