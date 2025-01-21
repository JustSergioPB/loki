import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { orgTable } from "./orgs";
import { relations } from "drizzle-orm";
import { credentialRequestTable } from "./credential-request";
import { DbUser } from "./users";
import { DbFormVersion } from "./form-versions";

export const credentialTable = pgTable("credentials", {
  id: uuid().primaryKey().defaultRandom(),
  encryptedContent: varchar().notNull(),
  credentialRequestId: uuid()
    .notNull()
    .references(() => credentialRequestTable.id, {
      onDelete: "cascade",
    }),
  orgId: uuid()
    .notNull()
    .references(() => orgTable.id, { onDelete: "cascade" }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const credentialTableRelations = relations(
  credentialTable,
  ({ one }) => ({
    org: one(orgTable, {
      fields: [credentialTable.orgId],
      references: [orgTable.id],
    }),
    credentialRequest: one(credentialRequestTable, {
      fields: [credentialTable.credentialRequestId],
      references: [credentialRequestTable.id],
    }),
  })
);

export type DbCredential = typeof credentialTable.$inferSelect;

export type CredentialWithIssuer = DbCredential & {
  issuer?: DbUser;
  formVersion: DbFormVersion;
};
