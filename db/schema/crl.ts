import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { orgs } from "./orgs";

export const crls = pgTable("crls", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  smartcontractAddress: varchar().notNull().unique(),
  orgId: integer()
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" })
    .unique(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
});

export const crlsRelations = relations(crls, ({ one }) => ({
  org: one(orgs, {
    fields: [crls.orgId],
    references: [orgs.id],
  }),
}));

export type Crl = typeof crls.$inferSelect;
export type CrlCreate = typeof crls.$inferInsert;
