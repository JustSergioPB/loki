import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as orgs from "./schema/orgs";
import * as userTokens from "./schema/user-tokens";
import * as users from "./schema/users";
import * as auditLogs from "./schema/audit-logs";
import * as formVersions from "./schema/form-versions";
import * as forms from "./schema/forms";
import * as dids from "./schema/dids";
import * as privateKeys from "./schema/private-keys";
import * as emailBridgeRequest from "./schema/credential-request";

const connectionString = process.env.DATABASE_URL!;
export const client = postgres(connectionString, { prepare: false });

export const db = drizzle({
  client,
  schema: {
    ...orgs,
    ...userTokens,
    ...users,
    ...auditLogs,
    ...forms,
    ...formVersions,
    ...dids,
    ...privateKeys,
    ...emailBridgeRequest,
  },
});
