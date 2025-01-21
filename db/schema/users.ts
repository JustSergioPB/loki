import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { auditLogTable } from "./audit-logs";
import { DbOrg, orgTable } from "./orgs";
import { userTokenTable } from "./user-tokens";
import { credentialTable } from "./credentials";
import { userRoles, userStatuses } from "@/lib/types/user";
import { didTable } from "./dids";

export const userRole = pgEnum("userRole", userRoles);
export const userStatus = pgEnum("userStatus", userStatuses);

export const userTable = pgTable(
  "users",
  {
    id: uuid().primaryKey().notNull().defaultRandom(),
    orgId: uuid()
      .notNull()
      .references(() => orgTable.id, { onDelete: "cascade" }),
    role: userRole().notNull().default("issuer"),
    status: userStatus().notNull().default("inactive"),
    fullName: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    position: varchar(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .$onUpdate(() => new Date()),
    confirmedAt: timestamp({ withTimezone: true }),
  },
  (table) => [
    {
      fullNameEmailIdx: unique("uniqueFullNamePerEmail").on(
        table.email,
        table.fullName
      ),
    },
  ]
);

export const userTableRelations = relations(userTable, ({ one, many }) => ({
  auditLogs: many(auditLogTable),
  credentials: many(credentialTable),
  did: one(didTable),
  org: one(orgTable, {
    fields: [userTable.orgId],
    references: [orgTable.id],
  }),
  userTokens: many(userTokenTable),
}));

export type DbUser = typeof userTable.$inferSelect;
export type DbUserCreate = typeof userTable.$inferInsert;

export type AuthUser = Pick<
  DbUser,
  "id" | "fullName" | "email" | "role" | "orgId"
>;

export type UserWithOrg = DbUser & {
  org: DbOrg;
};
