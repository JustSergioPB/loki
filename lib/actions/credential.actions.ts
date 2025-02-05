"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import {
  createCredential,
  deleteCredential,
  updateCredentialContent,
  updateCredentialValidity,
} from "../models/credential.model";
import { DbCredential } from "@/db/schema/credentials";
import { ValiditySchema } from "../schemas/validity.schema";
import { createCredentialRequest } from "../models/credential-request.model";
import { DbCredentialRequest } from "@/db/schema/credential-requests";

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

export async function updateCredentialContentAction(
  id: string,
  data: object
): Promise<ActionResult<DbCredential>> {
  const t = await getTranslations("Credential");

  try {
    const authUser = await authorize(["admin", "org-admin"]);
    const credential = await updateCredentialContent(id, data, authUser);

    return {
      success: {
        data: credential,
        message: t("updateValiditySucceded"),
      },
    };
  } catch (error) {
    console.error(error);
    return { error: { message: t("updateValidityFailed") } };
  }
}

export async function updateCredentialValidityAction(
  id: string,
  data: ValiditySchema
): Promise<ActionResult<[DbCredential, DbCredentialRequest]>> {
  const t = await getTranslations("Credential");

  try {
    const authUser = await authorize(["admin", "org-admin"]);

    const credential = await updateCredentialValidity(id, data, authUser);
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
