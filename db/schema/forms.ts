import { relations } from "drizzle-orm";
import { pgTable, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { orgTable } from "./orgs";
import { DbFormVersion, formVersionTable } from "./form-versions";

export const formTable = pgTable(
  "forms",
  {
    id: uuid().primaryKey().notNull().defaultRandom(),
    title: varchar({ length: 255 }).notNull(),
    orgId: uuid()
      .references(() => orgTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    {
      orgTitleIdx: unique("uniqueTitlePerOrg").on(table.orgId, table.title),
    },
  ]
);

export const formTableRelations = relations(formTable, ({ one, many }) => ({
  org: one(orgTable, {
    fields: [formTable.orgId],
    references: [orgTable.id],
  }),
  versions: many(formVersionTable),
}));

export type DbForm = typeof formTable.$inferSelect & {
  versions: DbFormVersion[];
};
export type DbFormCreate = typeof formTable.$inferInsert;
