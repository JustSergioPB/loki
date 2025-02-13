import { integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { orgTable } from "./orgs";
import { relations } from "drizzle-orm";
import { credentialTable } from "./credentials";
import { presentationTable } from "./presentations";

export const challengeTable = pgTable("challenges", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  code: integer().$default(() => Math.floor(Math.random() * 1000000)),
  credentialId: uuid()
    .notNull()
    .references(() => credentialTable.id, {
      onDelete: "cascade",
    }),
  expiresAt: timestamp({ withTimezone: true })
    .notNull()
    .$default(() => new Date(Date.now() + 5 * 60 * 1000)),
  orgId: uuid()
    .notNull()
    .references(() => orgTable.id, { onDelete: "cascade" }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const challengeTableRelations = relations(
  challengeTable,
  ({ one, many }) => ({
    org: one(orgTable, {
      fields: [challengeTable.orgId],
      references: [orgTable.id],
    }),
    credential: one(credentialTable, {
      fields: [challengeTable.credentialId],
      references: [credentialTable.id],
    }),
    presentations: many(presentationTable),
  })
);

export type DbChallenge = typeof challengeTable.$inferSelect;
