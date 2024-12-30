import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { orgs } from "./orgs";

export const address = pgTable("address", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  orgId: integer()
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" })
    .unique(),
  location: varchar(),
  stateProvince: varchar(),
  country: varchar({ length: 2 }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
});

export const addressRelations = relations(address, ({ one }) => ({
  org: one(orgs, {
    fields: [address.orgId],
    references: [orgs.id],
  }),
}));

export type Address = typeof address.$inferSelect;
export type AddressCreate = typeof address.$inferInsert;
