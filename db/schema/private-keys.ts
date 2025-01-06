import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const privateKeyTable = pgTable("privateKey", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  pem: text().notNull(),
  label: varchar().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
});
