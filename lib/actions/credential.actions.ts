"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import {
  createCredential,
  deleteCredential,
  updateCredentialValidity,
} from "../models/credential.model";
import { DbCredential } from "@/db/schema/credentials";
import { ValiditySchema } from "../schemas/validity.schema";
import { createCredentialRequest } from "../models/credential-request.model";
import { DbCredentialRequest } from "@/db/schema/credential-requests";

export async function createCredentialAction(
  formVersionId: string,
  data: object
): Promise<ActionResult<DbCredential>> {
  const t = await getTranslations("Credential");

  try {
    const authUser = await authorize(["admin", "org-admin"]);

    const credential = await createCredential(formVersionId, data, authUser);

    return { success: { data: credential, message: t("createSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("createFailed") } };
  }
}

export async function updateCredentialValidityAction(
  credentialId: string,
  data: ValiditySchema
): Promise<ActionResult<[DbCredential, DbCredentialRequest]>> {
  const t = await getTranslations("Credential");

  try {
    const authUser = await authorize(["admin", "org-admin"]);

    const credential = await updateCredentialValidity(
      credentialId,
      data,
      authUser
    );
    const challenge = await createCredentialRequest(credential.id, authUser);

    return {
      success: {
        data: [credential, challenge],
        message: t("updateValiditySucceded"),
      },
    };
  } catch (error) {
    console.error(error);
    return { error: { message: t("updateValidityFailed") } };
  }
}

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
