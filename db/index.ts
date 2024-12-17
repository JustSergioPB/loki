import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as orgs from "./schema/orgs";
import * as userSettings from "./schema/user-settings";
import * as userTokens from "./schema/user-tokens";
import * as users from "./schema/users";
import * as auditLogs from "./schema/audit-logs";

const connectionString = process.env.DATABASE_URL!;
export const client = postgres(connectionString, { prepare: false });

export const db = drizzle({
  client,
  schema: {
    ...orgs,
    ...userSettings,
    ...userTokens,
    ...users,
    ...auditLogs,
  },
});
