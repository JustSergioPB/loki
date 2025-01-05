export const auditActions = ["create", "update", "delete"] as const;
export type AuditAction = (typeof auditActions)[number];

export const auditableEntities = [
  "org",
  "user",
  "did",
  "schema",
  "schemaVersion",
  "privateKey",
] as const;
export type AuditableEntity = (typeof auditableEntities)[number];
