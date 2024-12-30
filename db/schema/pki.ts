import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { orgs } from "./orgs";

export const pkis = pgTable("pkis", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  smartcontractAddress: varchar().notNull().unique(),
  orgId: integer()
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" })
    .unique(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
});

export const PkisRelations = relations(pkis, ({ one }) => ({
  org: one(orgs, {
    fields: [pkis.orgId],
    references: [orgs.id],
  }),
}));

export type Pki = typeof pkis.$inferSelect;
export type PkiCreate = typeof pkis.$inferInsert;
