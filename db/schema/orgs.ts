import { relations } from "drizzle-orm";
import { pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./users";
import { userTokenTable } from "./user-tokens";
import { auditLogTable } from "./audit-logs";
import { credentialTable } from "./credentials";
import { didTable } from "./dids";
import { formVersionTable } from "./form-versions";
import { formTable } from "./forms";
import { orgStatus, orgTiers } from "@/lib/types/org";
import { bridgeTypes } from "@/lib/types/bridge";
import { credentialRequestTable } from "./credential-requests";

export const orgTier = pgEnum("orgTier", orgTiers);
export const orgStatuses = pgEnum("orgStatus", orgStatus);
export const orgBridge = pgEnum("orgBridge", bridgeTypes);

export const orgTable = pgTable("orgs", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  name: varchar({ length: 255 }).notNull().unique(),
  tier: orgTier().notNull().default("starter"),
  status: orgStatuses().notNull().default("verifying"),
  activeBridges: orgBridge().array().notNull(),
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
  credentialsRequests: many(credentialRequestTable),
  formVersions: many(formVersionTable),
  forms: many(formTable),
  userTokens: many(userTokenTable),
  users: many(userTable),
}));

export type DbOrg = typeof orgTable.$inferSelect;
export type DbOrgCreate = typeof orgTable.$inferInsert;
