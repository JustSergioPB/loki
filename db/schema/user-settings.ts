import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, timestamp } from "drizzle-orm/pg-core";
import { orgs } from "./orgs";
import { users } from "./users";

export const userLanguage = pgEnum("userLanguage", ["en", "es"]);

export const userSettings = pgTable("userSettings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  language: userLanguage().notNull().default("en"),
  userId: integer()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  orgId: integer()
    .references(() => orgs.id)
    .notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
});

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
  org: one(orgs, {
    fields: [userSettings.orgId],
    references: [orgs.id],
  }),
}));
