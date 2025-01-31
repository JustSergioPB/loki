import { relations } from "drizzle-orm";
import {
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
import { credentialRequestTable } from "./credential-requests";
import { formRequirementTable } from "./form-requirements";
import { JsonObjectType } from "@/lib/types/json-schema";

export const formVersionStatus = pgEnum(
  "formVersionStatus",
  formVersionStatuses
);

export const formVersionTable = pgTable(
  "formVersions",
  {
    id: uuid().primaryKey().notNull().defaultRandom(),
    title: varchar({ length: 255 }).notNull(),
    types: varchar().array().notNull(),
    description: varchar({ length: 255 }),
    version: integer().notNull().default(0),
    validFrom: timestamp(),
    validUntil: timestamp(),
    credentialSubject: jsonb().notNull().$type<JsonObjectType>(),
    status: formVersionStatus().notNull().default("draft"),
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
    emailBridgeRequests: many(credentialRequestTable),
    requirements: many(formRequirementTable),
    org: one(orgTable, {
      fields: [formVersionTable.orgId],
      references: [orgTable.id],
    }),
  })
);

export type DbFormVersion = typeof formVersionTable.$inferSelect;
