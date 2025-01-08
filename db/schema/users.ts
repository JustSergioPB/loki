import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { auditLogTable } from "./audit-logs";
import { orgTable } from "./orgs";
import { userTokenTable } from "./user-tokens";
import { userRoles, userStatuses } from "@/lib/models/user";

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

export const userTableRelations = relations(userTable, ({ one, many }) => ({
  org: one(orgTable, {
    fields: [userTable.orgId],
    references: [orgTable.id],
  }),
  tokens: many(userTokenTable),
  auditLogs: many(auditLogTable),
}));

export type DbUser = typeof userTable.$inferSelect & {
  org?: { name: string };
};

export type DbUserCreate = typeof userTable.$inferInsert;

export type AuthUser = Pick<
  DbUser,
  "id" | "fullName" | "email" | "role" | "orgId"
>;
