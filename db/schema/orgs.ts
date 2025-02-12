import { relations } from "drizzle-orm";
import { pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./users";
import { userTokenTable } from "./user-tokens";
import { auditLogTable } from "./audit-logs";
import { credentialTable } from "./credentials";
import { didTable } from "./dids";
import { formVersionTable } from "./form-versions";
import { orgStatus, orgTiers } from "@/lib/types/org";
import { challengeTable } from "./challenges";
import { presentationTable } from "./presentations";

export const orgTier = pgEnum("orgTier", orgTiers);
export const orgStatuses = pgEnum("orgStatus", orgStatus);

export const orgTable = pgTable("orgs", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  name: varchar({ length: 255 }).notNull().unique(),
  tier: orgTier().notNull().default("starter"),
  status: orgStatuses().notNull().default("verifying"),
  activeBridges: varchar().array().notNull(),
  verifiedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const orgTableRelations = relations(orgTable, ({ many }) => ({
  auditLogs: many(auditLogTable),
  crendetials: many(credentialTable),
  dids: many(didTable),
  challenges: many(challengeTable),
  formVersions: many(formVersionTable),
  userTokens: many(userTokenTable),
  users: many(userTable),
  presentations: many(presentationTable),
}));

export type DbOrg = typeof orgTable.$inferSelect;
export type DbOrgCreate = typeof orgTable.$inferInsert;
