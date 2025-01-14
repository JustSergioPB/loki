import {
  boolean,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { orgTable } from "./orgs";
import { formVersionTable } from "./form-versions";
import { relations } from "drizzle-orm";
import { credentialTable } from "./credentials";

export const emailBridgeRequestTable = pgTable("emailBridgeRequests", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  code: integer()
    .notNull()
    .$default(() => Math.floor(Math.random() * 1000000)),
  sentTo: varchar({ length: 255 }).notNull(),
  expiresAt: timestamp({ withTimezone: true })
    .notNull()
    .$default(() => new Date(Date.now() + 5 * 60 * 1000)),
  isBurnt: boolean().notNull().default(false),
  orgId: uuid()
    .notNull()
    .references(() => orgTable.id, { onDelete: "cascade" }),
  credentialId: uuid().references(() => credentialTable.id, {
    onDelete: "cascade",
  }),
  formVersionId: uuid()
    .notNull()
    .references(() => formVersionTable.id, { onDelete: "cascade" }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const emailBridgeRequestTableRelations = relations(
  emailBridgeRequestTable,
  ({ one }) => ({
    org: one(orgTable, {
      fields: [emailBridgeRequestTable.orgId],
      references: [orgTable.id],
    }),
    formVersion: one(formVersionTable, {
      fields: [emailBridgeRequestTable.formVersionId],
      references: [formVersionTable.id],
    }),
    credential: one(credentialTable, {
      fields: [emailBridgeRequestTable.credentialId],
      references: [credentialTable.id],
    }),
  })
);

export type DbEmailBridgeRequest = typeof emailBridgeRequestTable.$inferSelect;
