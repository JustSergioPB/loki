import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { DbOrg, orgTable } from "./orgs";
import { relations } from "drizzle-orm";
import { DbFormVersion, formVersionTable } from "./form-versions";
import { DbDID, didTable } from "./dids";
import { DbPresentation } from "./presentations";
import { DbChallenge } from "./challenges";
import { DbUser } from "./users";
import { VerifiableCredential } from "@/lib/types/verifiable-credential";

export const credentialTable = pgTable("credentials", {
  id: uuid().primaryKey().defaultRandom(),
  validFrom: timestamp({ withTimezone: true }),
  validUntil: timestamp({ withTimezone: true }),
  holder: varchar(),
  claims: jsonb().$type<object>(),
  credential: jsonb().$type<VerifiableCredential>(),
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

export type DbCredential = typeof credentialTable.$inferSelect & {
  formVersion?: DbFormVersion;
  presentations?: DbPresentation[];
  challenge?: DbChallenge;
  org?: DbOrg;
  issuer?: DbDID & {
    user?: DbUser;
  };
};
export type DbFilledCredential = {
  id: string;
  validFrom: Date | null;
  validUntil: Date | null;
  holder: string;
  claims: object;
  formVersion: DbFormVersion;
  org: DbOrg;
  issuer: DbDID & {
    user?: DbUser;
  };
};
