import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
} from "drizzle-orm/pg-core";
import { orgs } from "./orgs";
import { users } from "./users";

export const auditAction = pgEnum("auditAction", [
  "create",
  "update",
  "delete",
]);
export const auditableEntity = pgEnum("auditableEntity", [
  "org",
  "user",
  "certificate",
  "schema",
  "schemaVersion",
  "credential",
  "bridge",
  "emailBridge",
  "userSettings",
]);

export const auditLogs = pgTable("auditLogs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  entityId: integer().notNull(),
  entityType: auditableEntity().notNull(),
  action: auditAction().notNull(),
  userId: integer().references(() => users.id, { onDelete: "set null" }),
  orgId: integer().references(() => orgs.id, { onDelete: "set null" }),
  value: jsonb(),
  metadata: jsonb(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  org: one(orgs, {
    fields: [auditLogs.orgId],
    references: [orgs.id],
  }),
}));
