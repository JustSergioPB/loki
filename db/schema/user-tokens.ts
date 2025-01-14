import { relations } from "drizzle-orm";
import { pgTable, timestamp, pgEnum, uuid, boolean } from "drizzle-orm/pg-core";
import { userTable } from "./users";
import { orgTable } from "./orgs";
import { userTokenContexts } from "@/lib/types/user-token";

export const userTokenContext = pgEnum("userTokenContext", userTokenContexts);

export const userTokenTable = pgTable("userTokens", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  context: userTokenContext().notNull(),
  orgId: uuid()
    .references(() => orgTable.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid()
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: timestamp({ withTimezone: true })
    .notNull()
    .$default(() => new Date(Date.now() + 5 * 60 * 1000)),
  isBurnt: boolean().notNull().default(false),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
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
