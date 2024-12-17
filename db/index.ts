import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

import * as orgs from "./schema/orgs";
import * as userSettings from "./schema/user-settings";
import * as userTokens from "./schema/user-tokens";
import * as users from "./schema/users";
import * as auditLogs from "./schema/audit-logs";

export const db = drizzle({
  schema: {
    ...orgs,
    ...userSettings,
    ...userTokens,
    ...users,
    ...auditLogs,
  },
  connection: process.env.DATABASE_URL!,
});
