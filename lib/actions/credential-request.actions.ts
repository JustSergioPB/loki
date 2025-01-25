"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { ClaimSchema } from "../schemas/claim.schema";
import { authorize } from "../helpers/dal";
import { createCredentialRequest } from "../models/credential-request.model";

export async function createCredentialRequestAction(
  formVersionId: string,
  data: ClaimSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("CredentialRequest");

  try {
    const authUser = await authorize(["admin", "org-admin"]);

    await createCredentialRequest(formVersionId, data, authUser);

    return { success: { data: undefined, message: t("createSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("createFailed") } };
  }
}
