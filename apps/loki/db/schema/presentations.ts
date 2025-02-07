import { VerifiablePresentation } from "@/lib/types/verifiable-presentation";
import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { credentialRequestTable } from "./credential-requests";

export const presentationTable = pgTable("presentations", {
  id: uuid().primaryKey().defaultRandom(),
  content: jsonb().$type<VerifiablePresentation>(),
  challengeId: uuid()
    .notNull()
    .references(() => credentialRequestTable.id, { onDelete: "cascade" }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});

export type DbPresentation = typeof presentationTable.$inferSelect;
