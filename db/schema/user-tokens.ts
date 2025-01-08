import { relations } from "drizzle-orm";
import { pgTable, varchar, timestamp, pgEnum, uuid } from "drizzle-orm/pg-core";
import { userTable } from "./users";
import { orgTable } from "./orgs";
import { tokenContexts } from "@/lib/models/token";

export const userTokenContext = pgEnum("userTokenContext", tokenContexts);

export const userTokenTable = pgTable("userTokens", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  userId: uuid()
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(),
  orgId: uuid()
    .references(() => orgTable.id)
    .notNull(),
  token: varchar({ length: 255 }).notNull().unique(),
  context: userTokenContext().notNull(),
  sentTo: varchar({ length: 255 }).notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
});

export const userTokenTableRelations = relations(userTokenTable, ({ one }) => ({
  user: one(userTable, {
    fields: [userTokenTable.userId],
    references: [userTable.id],
  }),
  org: one(orgTable, {
    fields: [userTokenTable.orgId],
    references: [orgTable.id],
  }),
}));

export type DbUserToken = typeof userTokenTable.$inferSelect;
