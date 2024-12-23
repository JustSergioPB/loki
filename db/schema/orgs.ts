import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { userTokens } from "./user-tokens";
import { auditLogs } from "./audit-logs";
import { userSettings } from "./user-settings";

export const orgs = pgTable("orgs", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  publicId: uuid().notNull().defaultRandom(),
  verifiedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
});

export const orgsRelations = relations(orgs, ({ many }) => ({
  users: many(users),
  userTokens: many(userTokens),
  userSettings: many(userSettings),
  auditLogs: many(auditLogs),
}));

export type Org = typeof orgs.$inferSelect;
export type OrgCreate = typeof orgs.$inferInsert;
