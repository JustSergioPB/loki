import { pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { orgTable } from "./orgs";
import { relations } from "drizzle-orm";
import { DbUser } from "./users";
import { DbFormVersion, formVersionTable } from "./form-versions";
import { didTable } from "./dids";
import { credentialStatus } from "@/lib/types/credential";

export const credentialStatuses = pgEnum("credentialStatus", credentialStatus);

export const credentialTable = pgTable("credentials", {
  id: uuid().primaryKey().defaultRandom(),
  encryptedContent: varchar().notNull(),
  status: credentialStatuses().notNull().default("pending"),
  formVersionId: uuid()
    .notNull()
    .references(() => formVersionTable.id, { onDelete: "cascade" }),
  issuerId: varchar()
    .notNull()
    .references(() => didTable.did, { onDelete: "cascade" }),
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
    issuer: one(didTable, {
      fields: [credentialTable.issuerId],
      references: [didTable.did],
    }),
    formVersion: one(formVersionTable, {
      fields: [credentialTable.formVersionId],
      references: [formVersionTable.id],
    }),
  })
);

export type DbCredential = typeof credentialTable.$inferSelect;

export type CredentialWithIssuer = DbCredential & {
  issuer?: DbUser;
  formVersion: DbFormVersion;
};
