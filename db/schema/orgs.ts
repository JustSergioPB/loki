import { relations } from "drizzle-orm";
import { pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./users";
import { userTokenTable } from "./user-tokens";
import { auditLogTable } from "./audit-logs";
import { orgTierTypes } from "@/lib/models/org-tier";
import { orgStatus } from "@/lib/models/org";
import { DbDID } from "./dids";

export const orgTierType = pgEnum("orgTier", orgTierTypes);
export const orgStatuses = pgEnum("orgStatus", orgStatus);

export const orgTable = pgTable("orgs", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  name: varchar({ length: 255 }).notNull().unique(),
  tier: orgTierType().notNull().default("starter"),
  status: orgStatuses().notNull().default("verifying"),
  verifiedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
});

export const orgTableRelations = relations(orgTable, ({ many }) => ({
  users: many(userTable),
  userTokens: many(userTokenTable),
  auditLogs: many(auditLogTable),
}));

export type DbOrg = typeof orgTable.$inferSelect & {
  did?: DbDID;
};

export type DbOrgCreate = typeof orgTable.$inferInsert;
