import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { orgs } from "./orgs";
import { SchemaVersion, schemaVersions } from "./schema-versions";

export const schemas = pgTable(
  "schemas",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    publicId: uuid().notNull().defaultRandom(),
    title: varchar({ length: 255 }).notNull(),
    orgId: integer()
      .references(() => orgs.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }),
  },
  (table) => ({
    orgTitleIdx: uniqueIndex("uniqueTitlePerOrg").on(table.orgId, table.title),
  })
);

export const schemasRelations = relations(schemas, ({ one, many }) => ({
  org: one(orgs, {
    fields: [schemas.orgId],
    references: [orgs.id],
  }),
  versions: many(schemaVersions),
}));

export type Schema = typeof schemas.$inferSelect;
export type SchemaCreate = typeof schemas.$inferInsert;
export type SchemaWithVersions = Schema & { versions: SchemaVersion[] };
