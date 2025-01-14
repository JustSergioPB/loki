import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { DbUser, userTable } from "./users";
import { orgTable } from "./orgs";
import { relations } from "drizzle-orm";
import { DbFormVersion, formVersionTable } from "./form-versions";
import { emailBridgeRequestTable } from "./email-bridge-request";

export const credentialTable = pgTable("credentials", {
  id: uuid().primaryKey().defaultRandom(),
  iv: text().notNull(),
  authTag: text().notNull(),
  holder: varchar().notNull(),
  encryptedContent: varchar().notNull(),
  userId: uuid().references(() => userTable.id, { onDelete: "cascade" }),
  orgId: uuid()
    .notNull()
    .references(() => orgTable.id, { onDelete: "cascade" }),
  formVersionId: uuid()
    .notNull()
    .references(() => formVersionTable.id, { onDelete: "cascade" }),
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
    user: one(userTable, {
      fields: [credentialTable.userId],
      references: [userTable.id],
    }),
    formVersion: one(formVersionTable, {
      fields: [credentialTable.formVersionId],
      references: [formVersionTable.id],
    }),
    emailBridgeRequest: one(emailBridgeRequestTable),
  })
);

export type DbCredential = typeof credentialTable.$inferSelect & {
  formVersion?: DbFormVersion;
  user?: DbUser;
};

export type DbCreateCredential = typeof credentialTable.$inferInsert;
