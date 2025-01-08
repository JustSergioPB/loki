import { relations } from "drizzle-orm";
import {
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { orgTable } from "./orgs";
import { userTable } from "./users";
import { auditableEntities, auditActions } from "@/lib/models/audit-log";

export const auditAction = pgEnum("auditAction", auditActions);
export const auditableEntity = pgEnum("auditableEntity", auditableEntities);

export const auditLogTable = pgTable("auditLogs", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  entityId: varchar().notNull(),
  entityType: auditableEntity().notNull(),
  action: auditAction().notNull(),
  userId: uuid().references(() => userTable.id, { onDelete: "set null" }),
  orgId: uuid().references(() => orgTable.id, { onDelete: "set null" }),
  value: jsonb(),
  metadata: jsonb(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const auditLogsRelations = relations(auditLogTable, ({ one }) => ({
  user: one(userTable, {
    fields: [auditLogTable.userId],
    references: [userTable.id],
  }),
  org: one(orgTable, {
    fields: [auditLogTable.orgId],
    references: [orgTable.id],
  }),
}));
