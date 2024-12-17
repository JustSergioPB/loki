import "dotenv/config";
import { drizzle as devDB } from "drizzle-orm/postgres-js";
import { drizzle as prodDB } from "drizzle-orm/neon-http";
import postgres from "postgres";
import { neon } from "@neondatabase/serverless";

import * as orgs from "./schema/orgs";
import * as userSettings from "./schema/user-settings";
import * as userTokens from "./schema/user-tokens";
import * as users from "./schema/users";
import * as auditLogs from "./schema/audit-logs";

const connectionString = process.env.DATABASE_URL!;

export const db =
  process.env.NODE_ENV === "production"
    ? prodDB({
        client: neon(connectionString),
        schema: {
          ...orgs,
          ...userSettings,
          ...userTokens,
          ...users,
          ...auditLogs,
        },
      })
    : devDB({
        client: postgres(connectionString),
        schema: {
          ...orgs,
          ...userSettings,
          ...userTokens,
          ...users,
          ...auditLogs,
        },
      });
