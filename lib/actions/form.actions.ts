"use server";

import { FormSchema } from "../schemas/form.schema";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import { getTranslations } from "next-intl/server";
import {
  archiveForm,
  createForm,
  deleteForm,
  publishForm,
  updateForm,
} from "../models/form.model";
import { UserRole } from "../types/user";

//TODO: Add correct error messages on catch

const ALLOWED_ROLES: UserRole[] = ["org-admin", "admin"];

export async function createFormAction(
  data: FormSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("Form");

  try {
    const authUser = await authorize(ALLOWED_ROLES);

    await createForm(authUser, data);

    return { success: { data: undefined, message: t("createSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("createFailed") } };
  }
}

export async function updateFormAction(
  id: string,
  data: FormSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("Form");

  try {
    const authUser = await authorize(ALLOWED_ROLES);

    await updateForm(authUser, id, data);

    return { success: { data: undefined, message: t("updateSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("updateFailed") } };
  }
}

export async function deleteFormAction(
  id: string
): Promise<ActionResult<void>> {
  const t = await getTranslations("Form");
  try {
    const authUser = await authorize(ALLOWED_ROLES);

    await deleteForm(authUser, id);

    return { success: { data: undefined, message: t("deleteSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("deleteFailed") } };
  }
}

export async function publishFormAction(
  id: string
): Promise<ActionResult<boolean>> {
  const t = await getTranslations("FormVersions");

  try {
    const authUser = await authorize(ALLOWED_ROLES);

    await publishForm(authUser, id);

    return { success: { data: true, message: t("publishSucceeded") } };
  } catch (error) {
    console.log(error);
    return { error: { message: t("publishFailed") } };
  }
}

export async function archiveFormAction(
  id: string
): Promise<ActionResult<boolean>> {
  const t = await getTranslations("FormVersions");

  try {
    const authUser = await authorize(ALLOWED_ROLES);

    await archiveForm(authUser, id);

    return { success: { data: true, message: t("archiveSucceeded") } };
  } catch (error) {
    console.log(error);
    return { error: { message: t("archiveFailed") } };
  }
}
