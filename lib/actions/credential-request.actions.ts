"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import {
  createChallenge,
  renewChallenge,
} from "../models/credential-request.model";
import { DbChallenge } from "@/db/schema/challenges";

export async function createChallengeAction(
  credentialId: string
): Promise<ActionResult<DbChallenge>> {
  const t = await getTranslations("Challenge");

  try {
    const authUser = await authorize(["admin", "org-admin"]);

    const challenge = await createChallenge(
      credentialId,
      authUser
    );

    return {
      success: { data: challenge, message: t("createSucceded") },
    };
  } catch (error) {
    console.error(error);
    return { error: { message: t("createFailed") } };
  }
}

export async function renewChallengeAction(
  id: string
): Promise<ActionResult<DbChallenge>> {
  const t = await getTranslations("Challenge");

  try {
    const authUser = await authorize(["admin", "org-admin"]);

    const data = await renewChallenge(id, authUser);

    return { success: { data, message: t("renewSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("renewFailed") } };
  }
}
