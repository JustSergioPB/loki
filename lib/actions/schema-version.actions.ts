"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { schemaVersionTable } from "@/db/schema/schema-versions";
import { SchemaVersionError } from "../errors/schema-version.error";
import { SchemaVersion } from "../models/schema-version";
import { auditLogTable } from "@/db/schema/audit-logs";

const ALLOWED_ROLES = ["admin", "org-admin"];

export async function archiveSchemaVersion(
  id: string
): Promise<ActionResult<boolean>> {
  const t = await getTranslations("SchemaVersions");

  try {
    const authUser = await authorize(ALLOWED_ROLES);
    const version = await db.query.schemaVersionTable.findFirst({
      where: and(
        eq(schemaVersionTable.id, id),
        eq(schemaVersionTable.orgId, authUser.orgId)
      ),
    });

    if (!version) {
      throw new SchemaVersionError("notFound");
    }

    const schemaVersion = SchemaVersion.fromProps(version);
    schemaVersion.archive();

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(schemaVersionTable)
        .set({
          ...schemaVersion.props,
        })
        .where(eq(schemaVersionTable.id, id))
        .returning();

      await tx.insert(auditLogTable).values({
        entityId: id,
        entityType: "schemaVersion",
        action: "update",
        userId: authUser.id,
        orgId: authUser.orgId,
        value: updated,
      });
    });

    return { success: { data: true, message: t("archiveSucceeded") } };
  } catch (error) {
    console.log(error);
    return { error: { message: t("archiveFailed") } };
  }
}

export async function publishSchemaVersion(
  id: string
): Promise<ActionResult<boolean>> {
  const t = await getTranslations("SchemaVersions");

  try {
    const authUser = await authorize(ALLOWED_ROLES);
    const version = await db.query.schemaVersionTable.findFirst({
      where: and(
        eq(schemaVersionTable.id, id),
        eq(schemaVersionTable.orgId, authUser.orgId)
      ),
    });

    if (!version) {
      throw new SchemaVersionError("notFound");
    }

    const schemaVersion = SchemaVersion.fromProps(version);
    schemaVersion.publish();

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(schemaVersionTable)
        .set({
          ...schemaVersion.props,
        })
        .where(eq(schemaVersionTable.id, id))
        .returning();

      await tx.insert(auditLogTable).values({
        entityId: id,
        entityType: "schemaVersion",
        action: "update",
        userId: authUser.id,
        orgId: authUser.orgId,
        value: updated,
      });
    });

    return { success: { data: true, message: t("publicationSucceeded") } };
  } catch (error) {
    console.log(error);
    return { error: { message: t("publicationFailed") } };
  }
}
