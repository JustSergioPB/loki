"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import { db } from "@/db";
import { credentialTable } from "@/db/schema/credentials";
import { eq } from "drizzle-orm";
import { auditLogTable } from "@/db/schema/audit-logs";

export async function removeCredential(
  id: string
): Promise<ActionResult<void>> {
  const t = await getTranslations("Credential");
  try {
    const authUser = await authorize(["admin", "org-admin"]);

    await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(credentialTable)
        .where(eq(credentialTable.id, id))
        .returning();
      await tx.insert(auditLogTable).values({
        entityId: id,
        entityType: "credential",
        value: deleted,
        orgId: authUser.id,
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
