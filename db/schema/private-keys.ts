import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const privateKeyTable = pgTable("privateKeys", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  pem: text().notNull(),
  label: varchar().notNull().unique(),
  revocationReason: varchar(),
  revokedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});
