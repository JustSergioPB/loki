"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import { createRootDID, deleteDID } from "../models/did.model";

export async function createRootDIDAction(): Promise<ActionResult<void>> {
  const t = await getTranslations("Did");
  try {
    const authUser = await authorize(["admin"]);

    await createRootDID(authUser);

    return { success: { data: undefined, message: t("createSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("createFailed") } };
  }
}

export async function deleteDIDAction(id: string): Promise<ActionResult<void>> {
  const t = await getTranslations("DID");
  try {
    const authUser = await authorize(["admin"]);

    await deleteDID(authUser, id);

    return { success: { data: undefined, message: t("deleteSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("deleteFailed") } };
  }
}
