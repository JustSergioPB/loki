import { integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { orgTable } from "./orgs";
import { relations } from "drizzle-orm";
import { credentialTable } from "./credentials";

export const credentialRequestTable = pgTable("credentialRequests", {
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

export const credentialRequestTableRelations = relations(
  credentialRequestTable,
  ({ one }) => ({
    org: one(orgTable, {
      fields: [credentialRequestTable.orgId],
      references: [orgTable.id],
    }),
    credential: one(credentialTable, {
      fields: [credentialRequestTable.credentialId],
      references: [credentialTable.id],
    }),
  })
);

export type DbCredentialRequest = typeof credentialRequestTable.$inferSelect;
