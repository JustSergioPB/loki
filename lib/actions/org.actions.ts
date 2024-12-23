"use server";

import { db } from "@/db";
import { auditLogs } from "@/db/schema/audit-logs";
import { orgs } from "@/db/schema/orgs";
import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";

//TODO: Add correct error messages on catch

export async function removeOrg(id: number): Promise<ActionResult<void>> {
  const t = await getTranslations("Org");
  try {
    const authUser = await authorize(["admin"]);

    await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(orgs)
        .where(eq(orgs.id, id))
        .returning();
      await tx.insert(auditLogs).values({
        entityId: id,
        entityType: "org",
        value: deleted,
        orgId: authUser.orgId,
        userId: authUser.id,
        action: "delete",
      });
    });

    return { success: { data: undefined, message: t("deleteSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("deleteFailed") } };
  }
}
