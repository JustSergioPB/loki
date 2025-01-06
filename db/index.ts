import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as orgs from "./schema/orgs";
import * as userTokens from "./schema/user-tokens";
import * as users from "./schema/users";
import * as auditLogs from "./schema/audit-logs";
import * as schemaVersions from "./schema/schema-versions";
import * as schemas from "./schema/schemas";
import * as dids from "./schema/dids";
import * as privateKeys from "./schema/private-keys";

const connectionString = process.env.DATABASE_URL!;
export const client = postgres(connectionString, { prepare: false });

export const db = drizzle({
  client,
  schema: {
    ...orgs,
    ...userTokens,
    ...users,
    ...auditLogs,
    ...schemas,
    ...schemaVersions,
    ...dids,
    ...privateKeys,
  },
});
