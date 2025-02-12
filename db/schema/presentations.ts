import { VerifiablePresentation } from "@/lib/types/verifiable-presentation";
import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { credentialTable } from "./credentials";
import { orgTable } from "./orgs";
import { relations } from "drizzle-orm";

export const presentationTable = pgTable("presentations", {
  id: uuid().primaryKey().defaultRandom(),
  content: jsonb().$type<VerifiablePresentation>(),
  credentialId: uuid()
    .notNull()
    .references(() => credentialTable.id, { onDelete: "cascade" }),
  orgId: uuid()
    .notNull()
    .references(() => orgTable.id, { onDelete: "cascade" }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const credentialPresentationRelations = relations(
  presentationTable,
  ({ one, many }) => ({
    org: one(orgTable, {
      fields: [presentationTable.orgId],
      references: [orgTable.id],
    }),
    credential: one(credentialTable, {
      fields: [presentationTable.credentialId],
      references: [credentialTable.id],
    }),
    presentations: many(presentationTable),
  })
);

export type DbPresentation = typeof presentationTable.$inferSelect;
