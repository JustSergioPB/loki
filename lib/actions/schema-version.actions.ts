"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { schemaVersions } from "@/db/schema/schema-versions";
import { SchemaVersionError } from "../errors/schema-version.error";
import { SchemaVersion } from "../models/schema-version";
import { auditLogs } from "@/db/schema/audit-logs";

const ALLOWED_ROLES = ["admin", "org-admin"];

export async function archiveSchemaVersion(
  id: number
): Promise<ActionResult<boolean>> {
  const t = await getTranslations("SchemaVersions");

  try {
    const authUser = await authorize(ALLOWED_ROLES);
    const version = await db.query.schemaVersions.findFirst({
      where: and(
        eq(schemaVersions.id, id),
        eq(schemaVersions.orgId, authUser.orgId)
      ),
    });

    if (!version) {
      throw new SchemaVersionError("notFound");
    }

    const schemaVersion = SchemaVersion.fromProps(version);
    schemaVersion.archive();

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(schemaVersions)
        .set({
          ...schemaVersion.props,
        })
        .where(eq(schemaVersions.id, id))
        .returning();

      await tx.insert(auditLogs).values({
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
  id: number
): Promise<ActionResult<boolean>> {
  const t = await getTranslations("SchemaVersions");

  try {
    const authUser = await authorize(ALLOWED_ROLES);
    const version = await db.query.schemaVersions.findFirst({
      where: and(
        eq(schemaVersions.id, id),
        eq(schemaVersions.orgId, authUser.orgId)
      ),
    });

    if (!version) {
      throw new SchemaVersionError("notFound");
    }

    const schemaVersion = SchemaVersion.fromProps(version);
    schemaVersion.publish();

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(schemaVersions)
        .set({
          ...schemaVersion.props,
        })
        .where(eq(schemaVersions.id, id))
        .returning();

      await tx.insert(auditLogs).values({
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
