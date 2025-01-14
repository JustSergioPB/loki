import { db } from "@/db/index";
import { auditLogTable } from "@/db/schema/audit-logs";
import { didTable } from "@/db/schema/dids";
import { emailBridgeRequestTable } from "@/db/schema/email-bridge-request";
import { formVersionTable } from "@/db/schema/form-versions";
import { formTable } from "@/db/schema/forms";
import { orgTable } from "@/db/schema/orgs";
import { privateKeyTable } from "@/db/schema/private-keys";
import { userTokenTable } from "@/db/schema/user-tokens";
import { userTable } from "@/db/schema/users";
import { reset } from "drizzle-seed";

async function main() {
  await reset(db, {
    orgTable,
    userTokenTable,
    userTable,
    auditLogTable,
    formTable,
    formVersionTable,
    didTable,
    privateKeyTable,
    emailBridgeRequestTable,
  });
}

main();
