import { db } from "@/db/index";
import { auditLogTable } from "@/db/schema/audit-logs";
import { didTable } from "@/db/schema/dids";
import { credentialRequestTable } from "@/db/schema/credential-requests";
import { formVersionTable } from "@/db/schema/form-versions";
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
    formVersionTable,
    didTable,
    privateKeyTable,
    credentialRequestTable,
  });
}

main();
