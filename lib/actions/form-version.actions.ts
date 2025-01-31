"use server";

import { FormSchema } from "../schemas/form.schema";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import { getTranslations } from "next-intl/server";
import {
  archiveFormVersion,
  createFormVersion,
  deleteFormVersion,
  publishFormVersion,
  updateFormVersionContent,
  updateFormVersionValidity,
} from "../models/form.model";
import { UserRole } from "../types/user";
import { ValiditySchema } from "../schemas/validity.schema";
import { DbFormVersion } from "@/db/schema/form-versions";

//TODO: Add correct error messages on catch

const ALLOWED_ROLES: UserRole[] = ["org-admin", "admin"];

export async function createFormVersionAction(
  data: FormSchema
): Promise<ActionResult<DbFormVersion>> {
  const t = await getTranslations("FormVersion");

  try {
    const authUser = await authorize(ALLOWED_ROLES);

    const created = await createFormVersion(authUser, data);

    return {
      success: { data: created, message: t("createSucceded") },
    };
  } catch (error) {
    console.error(error);
    return { error: { message: t("createFailed") } };
  }
}

export async function updateFormVersionContentAction(
  id: string,
  data: FormSchema
): Promise<ActionResult<DbFormVersion>> {
  const t = await getTranslations("FormVersion");

  try {
    const authUser = await authorize(ALLOWED_ROLES);

    const updated = await updateFormVersionContent(authUser, id, data);

    return { success: { data: updated, message: t("updateSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("updateFailed") } };
  }
}

export async function updateFormVersionValidityAction(
  id: string,
  data: ValiditySchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("FormVersion");

  try {
    const authUser = await authorize(ALLOWED_ROLES);

    await updateFormVersionValidity(authUser, id, data);

    return { success: { data: undefined, message: t("updateSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("updateFailed") } };
  }
}

export async function deleteFormVersionAction(
  id: string
): Promise<ActionResult<void>> {
  const t = await getTranslations("FormVersion");
  try {
    const authUser = await authorize(ALLOWED_ROLES);

    await deleteFormVersion(authUser, id);

    return { success: { data: undefined, message: t("deleteSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("deleteFailed") } };
  }
}

export async function publishFormVersionAction(
  id: string
): Promise<ActionResult<boolean>> {
  const t = await getTranslations("FormVersions");

  try {
    const authUser = await authorize(ALLOWED_ROLES);

    await publishFormVersion(authUser, id);

    return { success: { data: true, message: t("publishSucceeded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("publishFailed") } };
  }
}

export async function archiveFormVersionAction(
  id: string
): Promise<ActionResult<boolean>> {
  const t = await getTranslations("FormVersions");

  try {
    const authUser = await authorize(ALLOWED_ROLES);

    await archiveFormVersion(authUser, id);

    return { success: { data: true, message: t("archiveSucceeded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("archiveFailed") } };
  }
}
