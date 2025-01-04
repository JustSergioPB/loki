export const auditActions = ["create", "update", "delete"] as const;
export type AuditAction = (typeof auditActions)[number];

export const auditableEntities = [
  "org",
  "user",
  "certificate",
  "schema",
  "schemaVersion",
  "credential",
  "bridge",
  "emailBridge",
  "userSettings",
] as const;
export type AuditableEntity = (typeof auditableEntities)[number];
