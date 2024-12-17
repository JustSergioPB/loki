// scripts/migrate.ts
import { db } from "@/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";

async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations completed");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
