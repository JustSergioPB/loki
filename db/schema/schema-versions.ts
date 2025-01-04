import { relations } from "drizzle-orm";
import { jsonb, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { orgTable } from "./orgs";
import { schemaTable } from "./schemas";
import {
  CredentialSchema,
  schemaVersionStatuses,
} from "@/lib/models/schema-version";

export const schemaVersionStatus = pgEnum(
  "schemaVersionStatus",
  schemaVersionStatuses
);

export const schemaVersionTable = pgTable("schemaVersions", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  content: jsonb().notNull().$type<CredentialSchema>(),
  status: schemaVersionStatus().notNull().default("draft"),
  schemaId: uuid()
    .references(() => schemaTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
  orgId: uuid()
    .references(() => orgTable.id, { onDelete: "cascade" })
    .notNull(),
});

export const schemaVersionTableRelations = relations(
  schemaVersionTable,
  ({ one }) => ({
    org: one(orgTable, {
      fields: [schemaVersionTable.orgId],
      references: [orgTable.id],
    }),
    schema: one(schemaTable, {
      fields: [schemaVersionTable.schemaId],
      references: [schemaTable.id],
    }),
  })
);

export type DbSchemaVersion = typeof schemaVersionTable.$inferSelect;
export type DbSchemaVersionCreate = typeof schemaVersionTable.$inferInsert;
