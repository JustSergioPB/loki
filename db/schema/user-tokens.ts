import { relations } from "drizzle-orm";
import {
  pgTable,
  integer,
  varchar,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { orgs } from "./orgs";

export const userTokenContext = pgEnum("userTokenContext", [
  "confirmation",
  "reset-password",
  "invitation",
]);

export const userTokens = pgTable("userTokens", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: integer()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  orgId: integer()
    .references(() => orgs.id)
    .notNull(),
  token: varchar({ length: 255 }).notNull().unique(),
  context: userTokenContext().notNull(),
  sentTo: varchar({ length: 255 }).notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
});

export const userTokensRelations = relations(userTokens, ({ one }) => ({
  user: one(users, {
    fields: [userTokens.userId],
    references: [users.id],
  }),
  org: one(orgs, {
    fields: [userTokens.orgId],
    references: [orgs.id],
  }),
}));

export type UserToken = typeof userTokens.$inferSelect;
