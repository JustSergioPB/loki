import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const privateKeyTable = pgTable("privateKeys", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  pem: text().notNull(),
  label: varchar().notNull().unique(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
});
