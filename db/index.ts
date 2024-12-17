import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as orgs from "./schema/orgs";
import * as userSettings from "./schema/user-settings";
import * as userTokens from "./schema/user-tokens";
import * as users from "./schema/users";
import * as auditLogs from "./schema/audit-logs";

const connectionString = process.env.POSTGRES_URL!;

export const queryClient =
  process.env.NODE_ENV === "production"
    ? postgres(connectionString, { prepare: false })
    : postgres(connectionString);

export const db = drizzle({
  client: queryClient,
  schema: {
    ...orgs,
    ...userSettings,
    ...userTokens,
    ...users,
    ...auditLogs,
  },
});
