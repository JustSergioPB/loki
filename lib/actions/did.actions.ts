"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import { db } from "@/db";
import { orgTable } from "@/db/schema/orgs";
import { didTable } from "@/db/schema/dids";
import { isNull, and, eq } from "drizzle-orm";
import { Org } from "../models/org";
import { UuidDIDProvider } from "@/providers/did.provider";
import { auditLogTable } from "@/db/schema/audit-logs";

export async function createRootDID(): Promise<ActionResult<void>> {
  const t = await getTranslations("Did");
  try {
    const authUser = await authorize(["admin"]);

    const rootOrgQuery = await db
      .select()
      .from(orgTable)
      .where(eq(orgTable.name, process.env.ROOT_ORG_NAME!))
      .leftJoin(
        didTable,
        and(eq(didTable.orgId, orgTable.id), isNull(didTable.userId))
      );

    if (!rootOrgQuery[0]) {
      throw new Error("missingRootOrg");
    }

    const rootOrg = Org.fromProps({
      ...rootOrgQuery[0].orgs,
      did: rootOrgQuery[0].dids ?? undefined,
    });

    const rootOrgDID = await new UuidDIDProvider().generateRootDID(rootOrg);

    await db.transaction(async (tx) => {
      const [insertedDID] = await tx
        .insert(didTable)
        .values({
          ...rootOrgDID.props,
          orgId: authUser.orgId,
        })
        .returning();
      await tx.insert(auditLogTable).values({
        entityId: insertedDID.did,
        entityType: "root-did",
        value: insertedDID,
        orgId: authUser.orgId,
        userId: authUser.id,
        action: "create",
      });
    });

    return { success: { data: undefined, message: t("createSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("createFailed") } };
  }
}
