"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { schemaTable } from "@/db/schema/schemas";
import { schemaVersionTable } from "@/db/schema/schema-versions";
import { auditLogTable } from "@/db/schema/audit-logs";
import { SchemaSchema } from "../schemas/schema.schema";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import { getTranslations } from "next-intl/server";
import { AuthUser } from "@/db/schema/users";
import { Schema } from "../models/schema";
import { SchemaVersion } from "../models/schema-version";

//TODO: Add correct error messages on catch

export async function createSchema(
  data: SchemaSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("Schema");

  try {
    const authUser = await authorize(["org-admin", "admin"]);
    const schema = Schema.create(data);
    const schemaVersion = schema.getLatestVersion();

    await db.transaction(async (tx) => {
      const [insertedSchema] = await tx
        .insert(schemaTable)
        .values({
          ...schema.props,
          orgId: authUser.orgId,
        })
        .returning();

      const [insertedSchemaVersion] = await tx
        .insert(schemaVersionTable)
        .values({
          ...schemaVersion.props,
          schemaId: insertedSchema.id,
          orgId: authUser.orgId,
        })
        .returning();

      await tx.insert(auditLogTable).values([
        {
          entityId: insertedSchema.id,
          entityType: "schema",
          action: "create",
          userId: authUser.id,
          orgId: authUser.orgId,
          value: insertedSchema,
        },
        {
          entityId: insertedSchemaVersion.id,
          entityType: "schemaVersion",
          action: "create",
          userId: authUser.id,
          orgId: authUser.orgId,
          value: insertedSchemaVersion,
        },
      ]);
    });
    return { success: { data: undefined, message: t("createSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("createFailed") } };
  }
}

export async function updateSchema(
  id: string,
  data: SchemaSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("Schema");

  try {
    const authUser = await authorize(["org-admin", "admin"]);

    const queryResult = await db
      .select()
      .from(schemaTable)
      .where(eq(schemaTable.id, id))
      .innerJoin(schemaVersionTable, eq(schemaVersionTable.schemaId, id));

    const schema = Schema.fromProps({
      ...queryResult[0].schemas,
      versions: queryResult.map((row) => row.schemaVersions),
    });

    schema.update(data);
    const latestVersion = schema.getLatestVersion();

    if (latestVersion.id) {
      await updateSchemaVersion(authUser, schema, latestVersion);
    } else {
      await createSchemaVersion(authUser, schema, latestVersion);
    }

    return { success: { data: undefined, message: t("updateSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("updateFailed") } };
  }
}

//TODO: Reevaluate if an schema could be deleted once there's a published version
export async function removeSchema(id: string): Promise<ActionResult<void>> {
  const t = await getTranslations("Schema");
  try {
    const authUser = await authorize(["org-admin", "admin"]);

    await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(schemaTable)
        .where(eq(schemaTable.id, id))
        .returning();

      await tx.insert(auditLogTable).values({
        entityId: id,
        entityType: "schema",
        action: "delete",
        orgId: authUser.orgId,
        userId: authUser.id,
        value: deleted,
      });
    });

    return { success: { data: undefined, message: t("deleteSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("deleteFailed") } };
  }
}

async function createSchemaVersion(
  authUser: AuthUser,
  schema: Schema,
  version: SchemaVersion
): Promise<void> {
  await db.transaction(async (tx) => {
    const [updatedSchema] = await tx
      .update(schemaTable)
      .set({
        ...schema.props,
      })
      .where(eq(schemaTable.id, schema.id!))
      .returning();

    const [insertedSchema] = await tx
      .insert(schemaVersionTable)
      .values({
        ...version.props,
        schemaId: schema.id!,
        orgId: authUser.orgId,
      })
      .returning();

    await tx.insert(auditLogTable).values([
      {
        entityId: schema.id!,
        entityType: "schema",
        action: "update",
        userId: authUser.id,
        orgId: authUser.orgId,
        value: updatedSchema,
      },
      {
        entityId: insertedSchema.id,
        entityType: "schemaVersion",
        action: "create",
        userId: authUser.id,
        orgId: authUser.orgId,
        value: insertedSchema,
      },
    ]);
  });
}

async function updateSchemaVersion(
  authUser: AuthUser,
  schema: Schema,
  version: SchemaVersion
): Promise<void> {
  await db.transaction(async (tx) => {
    const [updatedSchema] = await tx
      .update(schemaTable)
      .set({
        ...schema.props,
      })
      .where(eq(schemaTable.id, schema.id!))
      .returning();

    const [updatedVersion] = await tx
      .update(schemaVersionTable)
      .set({
        ...version.props,
      })
      .where(eq(schemaVersionTable.id, version.id!))
      .returning();

    await tx.insert(auditLogTable).values([
      {
        entityId: schema.id!,
        entityType: "schema",
        action: "update",
        userId: authUser.id,
        orgId: authUser.orgId,
        value: updatedSchema,
      },
      {
        entityId: updatedVersion.id,
        entityType: "schemaVersion",
        action: "update",
        userId: authUser.id,
        orgId: authUser.orgId,
        value: updatedVersion,
      },
    ]);
  });
}
