import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { userTable } from "./users";
import { orgTable } from "./orgs";
import { relations } from "drizzle-orm";
import { DIDDocument } from "@/lib/models/did-document";

export const didTable = pgTable("dids", {
  isActive: boolean().notNull().default(true),
  did: varchar().primaryKey().notNull(),
  document: jsonb().notNull().$type<DIDDocument>(),
  userId: uuid().references(() => userTable.id, { onDelete: "cascade" }),
  orgId: uuid()
    .notNull()
    .references(() => orgTable.id, { onDelete: "cascade" }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
});

export const didTableRelations = relations(didTable, ({ one }) => ({
  org: one(orgTable, {
    fields: [didTable.orgId],
    references: [orgTable.id],
  }),
  user: one(userTable, {
    fields: [didTable.userId],
    references: [userTable.id],
  }),
}));

export type DbDID = typeof didTable.$inferSelect;
export type DbCreateDID = typeof didTable.$inferInsert;
