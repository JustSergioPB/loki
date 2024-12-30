import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { orgs } from "./orgs";
import { pkis } from "./pki";

export const certificateLevel = pgEnum("certificateLevel", [
  "entity",
  "intermediate",
  "root",
]);
export const certificateStatus = pgEnum("certificateStatus", [
  "active",
  "inactive",
  "banned",
]);

export const certificates = pgTable("certificates", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  level: certificateLevel().notNull().default("entity"),
  status: certificateStatus().notNull().default("active"),
  privateKeyPem: text().notNull(),
  serialNumber: varchar().notNull(),
  orgId: integer()
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  pkiId: integer()
    .notNull()
    .references(() => pkis.id, { onDelete: "cascade" }),
  userId: integer()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
});

export const certificatesRelations = relations(certificates, ({ one }) => ({
  org: one(orgs, {
    fields: [certificates.orgId],
    references: [orgs.id],
  }),
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
  pki: one(pkis, {
    fields: [certificates.pkiId],
    references: [pkis.id],
  }),
}));

export type Certificate = typeof certificates.$inferSelect;
export type CertificateCreate = typeof certificates.$inferInsert;
