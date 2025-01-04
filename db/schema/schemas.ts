import { relations } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { orgTable } from "./orgs";
import { DbSchemaVersion, schemaVersionTable } from "./schema-versions";

export const schemaTable = pgTable(
  "schemas",
  {
    id: uuid().primaryKey().notNull().defaultRandom(),
    title: varchar({ length: 255 }).notNull(),
    orgId: uuid()
      .references(() => orgTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }),
  },
  (table) => ({
    orgTitleIdx: uniqueIndex("uniqueTitlePerOrg").on(table.orgId, table.title),
  })
);

export const schemaTableRelations = relations(schemaTable, ({ one, many }) => ({
  org: one(orgTable, {
    fields: [schemaTable.orgId],
    references: [orgTable.id],
  }),
  versions: many(schemaVersionTable),
}));

export type DbSchema = typeof schemaTable.$inferSelect & {
  versions: DbSchemaVersion[];
};
export type DbSchemaCreate = typeof schemaTable.$inferInsert;
