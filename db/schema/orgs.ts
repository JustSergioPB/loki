import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { userTokens } from "./user-tokens";
import { auditLogs } from "./audit-logs";
import { userSettings } from "./user-settings";
import { certificates } from "./certificate";
import { Address } from "./address";

export const orgStatus = pgEnum("orgStatus", [
  "onboarding",
  "verifying",
  "verified",
]);

export const orgs = pgTable("orgs", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  publicId: uuid().notNull().defaultRandom(),
  verifiedAt: timestamp({ withTimezone: true }),
  status: orgStatus().notNull().default("onboarding"),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
});

export const orgsRelations = relations(orgs, ({ many }) => ({
  users: many(users),
  userTokens: many(userTokens),
  userSettings: many(userSettings),
  auditLogs: many(auditLogs),
  certificates: many(certificates),
}));

export type Org = typeof orgs.$inferSelect;
export type OrgCreate = typeof orgs.$inferInsert;
export type OrgWithAddress = Org & { address: Address | null };
