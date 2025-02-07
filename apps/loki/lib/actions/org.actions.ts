"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import { deleteOrg, verifyOrg } from "../models/org.model";

//TODO: Add correct error messages on catch

export async function deleteOrgAction(id: string): Promise<ActionResult<void>> {
  const t = await getTranslations("Org");
  
  try {
    const authUser = await authorize(["admin"]);

    await deleteOrg(authUser, id);

    return { success: { data: undefined, message: t("deleteSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("deleteFailed") } };
  }
}

export async function verifyOrgAction(id: string): Promise<ActionResult<void>> {
  const t = await getTranslations("Org");

  try {
    const authUser = await authorize(["admin"]);

    await verifyOrg(authUser, id);

    return {
      success: { data: undefined, message: t("verificationSucceded") },
    };
  } catch (error) {
    console.error(error);
    return { error: { message: t("verificationFailed") } };
  }
}
