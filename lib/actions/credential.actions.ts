"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import { deleteCredential } from "../models/credential.model";

export async function deleteCredentialAction(
  id: string
): Promise<ActionResult<void>> {
  const t = await getTranslations("Credential");
  try {
    const authUser = await authorize(["admin", "org-admin"]);

    await deleteCredential(authUser, id);

    return { success: { data: undefined, message: t("deleteSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("deleteFailed") } };
  }
}
