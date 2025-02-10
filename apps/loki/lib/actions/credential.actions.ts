"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import {
  createCredential,
  deleteCredential,
  signCredential,
  updateCredential,
} from "../models/credential.model";
import { DbCredential } from "@/db/schema/credentials";
import { revalidatePath } from "next/cache";

export async function createCredentialAction(
  formVersionId: string
): Promise<ActionResult<DbCredential>> {
  const t = await getTranslations("Credential");

  try {
    const authUser = await authorize(["admin", "org-admin"]);

    const credential = await createCredential(formVersionId, authUser);

    return { success: { data: credential, message: t("createSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("createFailed") } };
  }
}

export async function updateCredentialAction(
  id: string,
  data: Partial<DbCredential>
): Promise<ActionResult<DbCredential>> {
  const t = await getTranslations("Credential");

  try {
    const authUser = await authorize(["admin", "org-admin"]);

    const credential = await updateCredential(id, data, authUser);

    return { success: { data: credential, message: t("createSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("createFailed") } };
  }
}

export async function signCredentialAction(
  id: string
): Promise<ActionResult<DbCredential>> {
  const t = await getTranslations("Credential");

  try {
    const authUser = await authorize(["admin", "org-admin"]);
    const credential = await signCredential(id, authUser);

    return {
      success: {
        data: credential,
        message: t("updateContentSucceded"),
      },
    };
  } catch (error) {
    console.error(error);
    return { error: { message: t("updateContentFailed") } };
  }
}

export async function deleteCredentialAction(
  id: string
): Promise<ActionResult<void>> {
  const t = await getTranslations("Credential");
  try {
    const authUser = await authorize(["admin", "org-admin"]);

    await deleteCredential(authUser, id);

    revalidatePath("/credentials");

    return { success: { data: undefined, message: t("deleteSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("deleteFailed") } };
  }
}
