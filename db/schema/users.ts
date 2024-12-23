import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  integer,
  uuid,
  varchar,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { auditLogs } from "./audit-logs";
import { orgs } from "./orgs";
import { userSettings } from "./user-settings";
import { userTokens } from "./user-tokens";

export const userRole = pgEnum("userRole", ["admin", "org-admin", "issuer"]);
export const userStatus = pgEnum("userStatus", [
  "active",
  "inactive",
  "banned",
]);

export const users = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    publicId: uuid().notNull().defaultRandom(),
    orgId: integer()
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    role: userRole().notNull().default("issuer"),
    status: userStatus().notNull().default("inactive"),
    fullName: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }),
    confirmedAt: timestamp({ withTimezone: true }),
  },
  (table) => ({
    fullNameEmailIdx: uniqueIndex("uniqueFullNamePerEmail").on(
      table.email,
      table.fullName
    ),
  })
);

export const usersRelations = relations(users, ({ one, many }) => ({
  org: one(orgs, {
    fields: [users.orgId],
    references: [orgs.id],
  }),
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  tokens: many(userTokens),
  auditLogs: many(auditLogs),
}));

export type User = typeof users.$inferSelect;
export type UserCreate = typeof users.$inferInsert;

export type UserWithOrg = Omit<User, "password" | "orgId"> & {
  org: { name: string };
};

export type AuthUser = Pick<
  User,
  "id" | "fullName" | "email" | "role" | "orgId"
>;
