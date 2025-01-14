"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { UserSchema } from "../schemas/user.schema";
import { authorize } from "../helpers/dal";
import { createUser, deleteUser, updateUser } from "../models/user.model";

//TODO: Add correct error messages on catch

export async function createUserAction(
  data: UserSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("User");
  try {
    const authUser = await authorize(["org-admin", "admin"]);

    await createUser(authUser, data);

    return { success: { data: undefined, message: t("createSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("createFailed") } };
  }
}

export async function updateUserAction(
  id: string,
  data: UserSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("User");
  try {
    const authUser = await authorize(["org-admin", "admin"]);

    await updateUser(authUser, id, data);

    return { success: { data: undefined, message: t("updateSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("updateFailed") } };
  }
}

export async function deleteUserAction(
  id: string
): Promise<ActionResult<void>> {
  const t = await getTranslations("User");
  try {
    const authUser = await authorize(["org-admin", "admin"]);

    await deleteUser(authUser, id);

    return { success: { data: undefined, message: t("deleteSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("deleteFailed") } };
  }
}
