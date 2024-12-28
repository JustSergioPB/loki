import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { orgs } from "./orgs";
import { schemas } from "./schemas";
import { CredentialSchema } from "@/lib/models/schema-version";

export const schemaVersionStatus = pgEnum("schemaVersionStatus", [
  "draft",
  "published",
  "archived",
]);

export const schemaVersions = pgTable("schemaVersions", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  publicId: uuid().notNull().defaultRandom(),
  content: jsonb().notNull().$type<CredentialSchema>(),
  status: schemaVersionStatus().notNull().default("draft"),
  schemaId: integer()
    .references(() => schemas.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
  orgId: integer()
    .references(() => orgs.id, { onDelete: "cascade" })
    .notNull(),
});

export const schemaVersionsRelations = relations(schemaVersions, ({ one }) => ({
  org: one(orgs, {
    fields: [schemaVersions.orgId],
    references: [orgs.id],
  }),
  schema: one(schemas, {
    fields: [schemaVersions.schemaId],
    references: [schemas.id],
  }),
}));

export type SchemaVersion = typeof schemaVersions.$inferSelect;
export type SchemaVersionCreate = typeof schemaVersions.$inferInsert;
