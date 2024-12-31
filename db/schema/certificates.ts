import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { orgs } from "./orgs";

export const certificateLevel = pgEnum("certificateLevel", [
  "entity",
  "intermediate",
  "root",
]);

export const certificateRevocationReason = pgEnum(
  "certificateRevocationReason",
  [
    "keyCompromise",
    "CACompromise",
    "affiliationChanged",
    "superseded",
    "cessationOfOperation",
    "privilegeWithdrawn",
    "hold",
    "weakAlgorithm",
  ]
);

export const certificates = pgTable("certificates", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  level: certificateLevel().notNull().default("entity"),
  isActive: boolean().notNull().default(true),
  privateKeyPem: text().notNull(),
  certPem: text().notNull(),
  serialNumber: varchar().notNull().unique(),
  orgId: integer()
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  userId: integer()
    .references(() => users.id, { onDelete: "cascade" }),
  revocationReason: certificateRevocationReason(),
  revokedAt: timestamp({ withTimezone: true }),
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
}));

export type Certificate = typeof certificates.$inferSelect;
export type CertificateCreate = typeof certificates.$inferInsert;
