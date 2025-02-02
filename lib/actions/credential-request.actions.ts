"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import {
  createCredentialRequest,
  renewCredentialRequest,
} from "../models/credential-request.model";
import { revalidatePath } from "next/cache";
import { DbCredentialRequest } from "@/db/schema/credential-requests";

export async function createCredentialRequestAction(
  credentialId: string
): Promise<ActionResult<DbCredentialRequest>> {
  const t = await getTranslations("CredentialRequest");

  try {
    const authUser = await authorize(["admin", "org-admin"]);

    const credentialRequest = await createCredentialRequest(
      credentialId,
      authUser
    );

    return {
      success: { data: credentialRequest, message: t("createSucceded") },
    };
  } catch (error) {
    console.error(error);
    return { error: { message: t("createFailed") } };
  }
}

export async function renewCredentialRequestAction(
  credentialId: string,
  credentialRequestId: string
): Promise<ActionResult<void>> {
  const t = await getTranslations("CredentialRequest");

  try {
    const authUser = await authorize(["admin", "org-admin"]);

    await renewCredentialRequest(credentialRequestId, authUser);

    revalidatePath(`credentials/${credentialId}`);

    return { success: { data: undefined, message: t("renewSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("renewFailed") } };
  }
}
