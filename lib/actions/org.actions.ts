"use server";

import { db } from "@/db";
import { auditLogTable } from "@/db/schema/audit-logs";
import { orgTable } from "@/db/schema/orgs";
import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";

//TODO: Add correct error messages on catch

export async function removeOrg(id: string): Promise<ActionResult<void>> {
  const t = await getTranslations("Org");
  try {
    const authUser = await authorize(["admin"]);

    await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(orgTable)
        .where(eq(orgTable.id, id))
        .returning();
      await tx.insert(auditLogTable).values({
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
