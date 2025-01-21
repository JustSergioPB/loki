import {
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
import { DbDID, didTable } from "./dids";

export const credentialRequestTable = pgTable("credentialRequests", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  encryptedContent: varchar(),
  code: integer().$default(() => Math.floor(Math.random() * 1000000)),
  expiresAt: timestamp({ withTimezone: true })
    .notNull()
    .$default(() => new Date(Date.now() + 5 * 60 * 1000)),
  orgId: uuid()
    .notNull()
    .references(() => orgTable.id, { onDelete: "cascade" }),
  formVersionId: uuid()
    .notNull()
    .references(() => formVersionTable.id, { onDelete: "cascade" }),
  issuerId: uuid()
    .notNull()
    .references(() => didTable.did, { onDelete: "cascade" }),
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
    formVersion: one(formVersionTable, {
      fields: [credentialRequestTable.formVersionId],
      references: [formVersionTable.id],
    }),
    credential: one(credentialTable),
    issuer: one(didTable, {
      fields: [credentialRequestTable.issuerId],
      references: [didTable.did],
    }),
  })
);

export type DbCredentialRequest = typeof credentialRequestTable.$inferSelect;

export type CredentialRequestWithIssuer = DbCredentialRequest & {
  issuer: DbDID;
};
