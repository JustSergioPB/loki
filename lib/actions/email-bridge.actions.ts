"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import {
  createEmailBridge,
  updateEmailBridge,
  toggleEmailBridge,
} from "../models/email-bridge.model";
import { EmailBridgeSchema } from "../schemas/email-bridge.schema";
import { revalidatePath } from "next/cache";

export async function toggleEmailBridgeAction(
  value: boolean
): Promise<ActionResult<void>> {
  const t = await getTranslations("Bridge");

  try {
    const authUser = await authorize(["admin", "org-admin"]);

    await toggleEmailBridge(authUser, value);

    revalidatePath("/brigdes");

    return { success: { data: undefined, message: t("toggleSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("toggleFailed") } };
  }
}

export async function createEmailBridgeAction(
  data: EmailBridgeSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("Bridge");

  try {
    const authUser = await authorize(["admin", "org-admin"]);

    await createEmailBridge(authUser, data.domains);

    return { success: { data: undefined, message: t("updateSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("updateFailed") } };
  }
}

export async function updateEmailBridgeAction(
  data: EmailBridgeSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("Bridge");

  try {
    const authUser = await authorize(["admin", "org-admin"]);

    await updateEmailBridge(authUser, data.domains);

    return { success: { data: undefined, message: t("updateSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("updateFailed") } };
  }
}
