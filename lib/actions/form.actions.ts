"use server";

import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { formTable } from "@/db/schema/forms";
import { formVersionTable } from "@/db/schema/form-versions";
import { auditLogTable } from "@/db/schema/audit-logs";
import { FormSchema } from "../schemas/form.schema";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import { getTranslations } from "next-intl/server";
import { AuthUser } from "@/db/schema/users";
import { Form } from "../models/form";
import { FormVersion, FormVersionStatus } from "../models/form-version";
import { FormError } from "../errors/form.error";

//TODO: Add correct error messages on catch

const ALLOWED_ROLES = ["org-admin", "admin"];

export async function createForm(
  data: FormSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("Form");

  try {
    const authUser = await authorize(ALLOWED_ROLES);
    const form = Form.create(data);
    const formVersion = form.latestVersion;

    await db.transaction(async (tx) => {
      const [insertedForm] = await tx
        .insert(formTable)
        .values({
          ...form.props,
          orgId: authUser.orgId,
        })
        .returning();

      const [insertedFormVersion] = await tx
        .insert(formVersionTable)
        .values({
          ...formVersion.props,
          formId: insertedForm.id,
          orgId: authUser.orgId,
        })
        .returning();

      await tx.insert(auditLogTable).values([
        {
          entityId: insertedForm.id,
          entityType: "form",
          action: "create",
          userId: authUser.id,
          orgId: authUser.orgId,
          value: insertedForm,
        },
        {
          entityId: insertedFormVersion.id,
          entityType: "formVersion",
          action: "create",
          userId: authUser.id,
          orgId: authUser.orgId,
          value: insertedFormVersion,
        },
      ]);
    });
    return { success: { data: undefined, message: t("createSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("createFailed") } };
  }
}

export async function updateForm(
  id: string,
  data: FormSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("Form");

  try {
    const authUser = await authorize(ALLOWED_ROLES);

    const queryResult = await db
      .select()
      .from(formTable)
      .where(eq(formTable.id, id))
      .innerJoin(formVersionTable, eq(formVersionTable.formId, id));

    const form = Form.fromProps({
      ...queryResult[0].forms,
      versions: queryResult.map((row) => row.formVersions),
    });

    form.update(data);
    const latestVersion = form.latestVersion;

    if (latestVersion.id) {
      await updateFormVersion(authUser, form, latestVersion);
    } else {
      await createFormVersion(authUser, form, latestVersion);
    }

    return { success: { data: undefined, message: t("updateSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("updateFailed") } };
  }
}

//TODO: Reevaluate if an form could be deleted once there's a published version
export async function removeForm(id: string): Promise<ActionResult<void>> {
  const t = await getTranslations("Form");
  try {
    const authUser = await authorize(ALLOWED_ROLES);

    await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(formTable)
        .where(eq(formTable.id, id))
        .returning();

      await tx.insert(auditLogTable).values({
        entityId: id,
        entityType: "form",
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

export async function changeFormState(
  id: string,
  newStatus: FormVersionStatus
): Promise<ActionResult<boolean>> {
  const t = await getTranslations("FormVersions");

  try {
    const authUser = await authorize(ALLOWED_ROLES);
    const formQuery = await db
      .select()
      .from(formTable)
      .where(eq(formTable.id, id))
      .innerJoin(formVersionTable, eq(formVersionTable.formId, formTable.id))
      .orderBy(asc(formVersionTable.createdAt))
      .limit(1);

    if (!formQuery[0]) {
      throw new FormError("notFound");
    }

    const form = Form.fromProps({
      ...formQuery[0].forms,
      versions: formQuery[0].formVersions ? [formQuery[0].formVersions] : [],
    });

    if (newStatus === "published") form.latestVersion.publish();
    if (newStatus === "archived") form.latestVersion.archive();

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(formVersionTable)
        .set({
          ...form.latestVersion.props,
        })
        .where(eq(formVersionTable.id, form.latestVersion.id!))
        .returning();

      await tx.insert(auditLogTable).values({
        entityId: id,
        entityType: "formVersion",
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

async function createFormVersion(
  authUser: AuthUser,
  form: Form,
  version: FormVersion
): Promise<void> {
  await db.transaction(async (tx) => {
    const [updatedForm] = await tx
      .update(formTable)
      .set({
        ...form.props,
      })
      .where(eq(formTable.id, form.id!))
      .returning();

    const [insertedForm] = await tx
      .insert(formVersionTable)
      .values({
        ...version.props,
        formId: form.id!,
        orgId: authUser.orgId,
      })
      .returning();

    await tx.insert(auditLogTable).values([
      {
        entityId: form.id!,
        entityType: "form",
        action: "update",
        userId: authUser.id,
        orgId: authUser.orgId,
        value: updatedForm,
      },
      {
        entityId: insertedForm.id,
        entityType: "formVersion",
        action: "create",
        userId: authUser.id,
        orgId: authUser.orgId,
        value: insertedForm,
      },
    ]);
  });
}

async function updateFormVersion(
  authUser: AuthUser,
  form: Form,
  version: FormVersion
): Promise<void> {
  await db.transaction(async (tx) => {
    const [updatedForm] = await tx
      .update(formTable)
      .set({
        ...form.props,
      })
      .where(eq(formTable.id, form.id!))
      .returning();

    const [updatedVersion] = await tx
      .update(formVersionTable)
      .set({
        ...version.props,
      })
      .where(eq(formVersionTable.id, version.id!))
      .returning();

    await tx.insert(auditLogTable).values([
      {
        entityId: form.id!,
        entityType: "form",
        action: "update",
        userId: authUser.id,
        orgId: authUser.orgId,
        value: updatedForm,
      },
      {
        entityId: updatedVersion.id,
        entityType: "formVersion",
        action: "update",
        userId: authUser.id,
        orgId: authUser.orgId,
        value: updatedVersion,
      },
    ]);
  });
}
