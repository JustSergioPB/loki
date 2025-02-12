"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { LoginSchema } from "../schemas/login.schema";
import { createSession, deleteSession } from "../helpers/session";
import { SignUpSchema } from "../schemas/sign-up.schema";
import { ResetPasswordSchema } from "../schemas/reset-password.schema";
import { ConfirmAccountSchema } from "../schemas/confirm-account.schema";
import { EmailSchema } from "../schemas/email.schema";
import {
  confirmUserAccount,
  loginUser,
  resendUserConfirmation,
  resetUserPassword,
  sendUserForgotPassword,
  signUpUser,
} from "../models/auth.model";

//TODO: Add correct error messages on catch

export async function loginUserAction(
  data: LoginSchema
): Promise<ActionResult<string>> {
  const t = await getTranslations("Login");

  try {
    const user = await loginUser(data);

    let redirect: string = "/dashboard";

    if (user.status === "inactive") {
      redirect = "/inactive";
    } else if (!user.confirmedAt) {
      redirect = "/hall";
    } else if (user.org?.status === "onboarding") {
      redirect = "/onboarding";
    } else if (user.org?.status === "verifying") {
      redirect = "/verifying";
    }

    await createSession({
      userId: user.id,
    });

    return { success: { data: redirect, message: t("succeded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("failed") } };
  }
}

export async function signUpUserAction(
  data: SignUpSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("SignUp");

  try {
    await signUpUser(data);

    return { success: { data: undefined, message: t("succeded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("failed") } };
  }
}

export async function resendUserConfirmationAction(
  data: EmailSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("ConfirmAccount");

  try {
    await resendUserConfirmation(data.email);

    return {
      success: { data: undefined, message: t("resendSucceded") },
    };
  } catch (error) {
    console.error(error);
    return { error: { message: t("resendFailed") } };
  }
}

export async function confirmUserAccountAction(
  data: ConfirmAccountSchema,
  token: string
): Promise<ActionResult<void>> {
  const t = await getTranslations("ConfirmAccount");

  try {
    const user = await confirmUserAccount(token, data.position);

    await createSession({
      userId: user.id,
    });
    return { success: { data: undefined, message: t("succeded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("failed") } };
  }
}

export async function sendUserForgotPasswordAction(
  data: EmailSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("ForgotPassword");

  try {
    await sendUserForgotPassword(data.email);

    return { success: { data: undefined, message: t("succeded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("failed") } };
  }
}

export async function resetUserPasswordAction(
  data: ResetPasswordSchema,
  token: string
): Promise<ActionResult<void>> {
  const t = await getTranslations("ResetPassword");

  try {
    await resetUserPassword(token, data.password);

    return { success: { data: undefined, message: t("succeded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("failed") } };
  }
}

export async function logoutUserAction(): Promise<ActionResult<void>> {
  const t = await getTranslations("Login");

  try {
    deleteSession();
    return { success: { data: undefined, message: t("logoutSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("logoutFailed") } };
  }
}
