import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { orgTable } from "./orgs";
import { formVersionStatuses } from "@/lib/types/form-version";
import { credentialTable } from "./credentials";
import { challengeTable } from "./challenges";
import { formRequirementTable } from "./form-requirements";
import { JsonObjectType } from "@/lib/types/json-schema";
import { CredentialSchema } from "@/lib/types/credential-schema";

export const formVersionStatus = pgEnum(
  "formVersionStatus",
  formVersionStatuses
);

export const formVersionTable = pgTable(
  "formVersions",
  {
    id: uuid().primaryKey().notNull().defaultRandom(),
    title: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }),
    version: integer().notNull().default(0),
    validFrom: timestamp(),
    validUntil: timestamp(),
    types: varchar().array().notNull().default(["JsonSchema"]),
    credentialContext: varchar()
      .array()
      .notNull()
      .default(["VerifiableCredential"]),
    credentialTypes: varchar()
      .array()
      .notNull()
      .default(["VerifiableCredential"]),
    credentialSubject: jsonb().notNull().$type<JsonObjectType>(),
    isArchived: boolean().default(false),
    credentialSchema: jsonb().$type<CredentialSchema>(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .$onUpdate(() => new Date()),
    orgId: uuid()
      .references(() => orgTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    {
      orgTitleIdx: unique("uniqueTitlePerOrg").on(
        table.orgId,
        table.title,
        table.version
      ),
    },
  ]
);

export const formVersionTableRelations = relations(
  formVersionTable,
  ({ one, many }) => ({
    credentials: many(credentialTable),
    emailBridgeRequests: many(challengeTable),
    requirements: many(formRequirementTable),
    org: one(orgTable, {
      fields: [formVersionTable.orgId],
      references: [orgTable.id],
    }),
  })
);

export type DbFormVersion = typeof formVersionTable.$inferSelect;
