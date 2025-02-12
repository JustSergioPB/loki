import { pgTable, uuid, boolean } from "drizzle-orm/pg-core";
import { orgTable } from "./orgs";
import { formVersionTable } from "./form-versions";
import { relations } from "drizzle-orm";

export const formRequirementTable = pgTable("formRequirement", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  formVersionId: uuid()
    .references(() => formVersionTable.id, { onDelete: "cascade" })
    .notNull(),
  isRequired: boolean().notNull().default(false),
  requirementId: uuid()
    .references(() => formVersionTable.id, { onDelete: "cascade" })
    .notNull(),
  orgId: uuid()
    .references(() => orgTable.id, { onDelete: "cascade" })
    .notNull(),
});

export const formRequirements = relations(formRequirementTable, ({ one }) => ({
  formVersion: one(formVersionTable, {
    fields: [formRequirementTable.formVersionId],
    references: [formVersionTable.id],
  }),
  requirement: one(formVersionTable, {
    fields: [formRequirementTable.requirementId],
    references: [formVersionTable.id],
  }),
}));
