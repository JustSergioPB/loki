import { relations } from "drizzle-orm";
import { jsonb, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { orgTable } from "./orgs";
import { formTable } from "./forms";
import { formVersionStatuses } from "@/lib/types/form";
import { CredentialSchema } from "@/lib/types/credential-schema";
import { credentialTable } from "./credentials";
import { credentialRequestTable } from "./credential-requests";

export const formVersionStatus = pgEnum(
  "formVersionStatus",
  formVersionStatuses
);

export const formVersionTable = pgTable("formVersions", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  credentialSchema: jsonb().notNull().$type<CredentialSchema>(),
  status: formVersionStatus().notNull().default("draft"),
  formId: uuid()
    .references(() => formTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
  orgId: uuid()
    .references(() => orgTable.id, { onDelete: "cascade" })
    .notNull(),
});

export const formVersionTableRelations = relations(
  formVersionTable,
  ({ one, many }) => ({
    credentials: many(credentialTable),
    emailBridgeRequests: many(credentialRequestTable),
    org: one(orgTable, {
      fields: [formVersionTable.orgId],
      references: [orgTable.id],
    }),
    form: one(formTable, {
      fields: [formVersionTable.formId],
      references: [formTable.id],
    }),
  })
);

export type DbFormVersion = typeof formVersionTable.$inferSelect;
export type DbFormVersionCreate = typeof formVersionTable.$inferInsert;
