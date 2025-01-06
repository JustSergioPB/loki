import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { orgTable } from "./orgs";
import { relations } from "drizzle-orm";
import { userTable } from "./users";

export const privateKeyTable = pgTable("privateKey", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  pem: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
  orgId: uuid()
    .references(() => orgTable.id, { onDelete: "cascade" })
    .notNull(),
});

export const privateKeyTableRelations = relations(
  privateKeyTable,
  ({ one }) => ({
    org: one(orgTable, {
      fields: [privateKeyTable.orgId],
      references: [orgTable.id],
    }),
    user: one(userTable, {
      fields: [privateKeyTable.orgId],
      references: [userTable.id],
    }),
  })
);
