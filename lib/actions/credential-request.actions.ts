"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import {
  createCredentialRequest,
  renewCredentialRequest,
} from "../models/credential-request.model";
import { revalidatePath } from "next/cache";
import { DbCredential } from "@/db/schema/credentials";

export async function createCredentialRequestAction(
  formVersionId: string,
  data: object
): Promise<ActionResult<DbCredential>> {
  const t = await getTranslations("CredentialRequest");

  try {
    const authUser = await authorize(["admin", "org-admin"]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, credential] = await createCredentialRequest(
      formVersionId,
      data,
      authUser
    );

    return { success: { data: credential, message: t("createSucceded") } };
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
