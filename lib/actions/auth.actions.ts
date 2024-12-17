"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { LoginSchema } from "../schemas/login.schema";
import { createSession, deleteSession } from "../helpers/session";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { orgs } from "@/db/schema/orgs";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import { SignUpSchema } from "../schemas/sign-up.schema";
import { UserError } from "../errors/user.error";
import { Org } from "../models/org";
import { User } from "../models/user";
import { OrgError } from "../errors/org.error";
import { userTokens } from "@/db/schema/user-tokens";
import { Token } from "../models/token";
import { TokenError } from "../errors/token.error";
import { ResetPasswordSchema } from "../schemas/reset-password.schema";

export async function login(data: LoginSchema): Promise<ActionResult<boolean>> {
  const t = await getTranslations("Login");

  try {
    const queryResult = await db
      .select()
      .from(users)
      .where(eq(sql`lower(${users.email})`, data.email.toLowerCase()))
      .innerJoin(orgs, eq(users.orgId, orgs.id));

    if (queryResult.length == 0) {
      throw new UserError("notFound");
    }

    await User.fromProps(queryResult[0].users).login(data.password);

    if (!queryResult[0].users.confirmedAt || !queryResult[0].orgs.verifiedAt) {
      return { success: { data: false, message: t("succeded") } };
    }

    await createSession({
      userId: queryResult[0].users.id,
    });

    return { success: { data: true, message: t("succeded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("failed") } };
  }
}

export async function signUp(
  data: SignUpSchema
): Promise<ActionResult<boolean>> {
  const t = await getTranslations("SignUp");

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(sql`lower(${users.email})`, data.email.toLowerCase()),
    });

    if (existingUser) {
      throw new UserError("alreadyExists");
    }

    const existingOrg = await db.query.orgs.findFirst({
      where: eq(orgs.name, data.orgName),
    });

    if (existingOrg) {
      throw new OrgError("alreadyExists");
    }

    const org = Org.create({ name: data.orgName });
    const user = await User.signUp(data);
    const token = Token.create({ sentTo: data.email, context: "confirmation" });

    await db.transaction(async (tx) => {
      const [{ id: orgId }] = await tx
        .insert(orgs)
        .values({
          ...org.props,
        })
        .returning();
      const [{ id: userId }] = await tx
        .insert(users)
        .values({
          ...user.props,
          orgId,
        })
        .returning();
      await tx.insert(userTokens).values({
        ...token.props,
        orgId,
        userId,
      });
    });

    return { success: { data: true, message: t("succeded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("failed") } };
  }
}

export async function resendConfirmationMail(email: string) {
  const t = await getTranslations("ConfirmAccount");

  try {
    const user = await db.query.users.findFirst({
      where: eq(sql`lower(${users.email})`, email.toLowerCase()),
    });

    if (!user) {
      throw new UserError("notFound");
    }

    const token = Token.create({
      sentTo: email,
      context: "confirmation",
    });

    await db.insert(userTokens).values({
      ...token.props,
      orgId: user.orgId,
      userId: user.id,
    });

    //await this.mailProvider.sendConfirmation(user.email, insertedToken);

    return {
      success: { data: true, message: t("resendSucceded") },
    };
  } catch (error) {
    console.error(error);
    return { error: { message: t("resendFailed") } };
  }
}

export async function confirmAccount(
  token: string
): Promise<ActionResult<boolean>> {
  const t = await getTranslations("ConfirmAccount");

  try {
    const queryResult = await db
      .select()
      .from(users)
      .innerJoin(userTokens, eq(users.id, userTokens.userId))
      .innerJoin(orgs, eq(users.orgId, orgs.id))
      .where(eq(userTokens.token, token));

    if (queryResult.length == 0) {
      throw new TokenError("notFound");
    }

    const user = User.fromProps(queryResult[0].users);
    const confirmationToken = Token.fromProps(queryResult[0].userTokens);
    const org = Org.fromProps(queryResult[0].orgs);

    confirmationToken.validate("confirmation");
    user.confirm();
    org.verify();

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ ...user.props })
        .where(eq(users.id, user.id!));
      await tx
        .update(userTokens)
        .set({ updatedAt: sql`NOW()` })
        .where(eq(userTokens.id, confirmationToken.id!));
      await tx
        .update(orgs)
        .set({ ...org.props })
        .where(eq(orgs.id, org.id!));
    });

    await createSession({
      userId: user.id!,
    });

    return { success: { data: true, message: t("succeded") } };
  } catch(error) {
    console.error(error);
    return { error: { message: t("failed") } };
  }
}

export async function forgotPassword(
  email: string
): Promise<ActionResult<boolean>> {
  const t = await getTranslations("ForgotPassword");

  try {
    const user = await db.query.users.findFirst({
      where: eq(sql`lower(${users.email})`, email.toLowerCase()),
    });

    if (!user) {
      throw new UserError("notFound");
    }

    const token = Token.create({
      sentTo: user.email,
      context: "reset-password",
    });

    await db.insert(userTokens).values({
      ...token.props,
      orgId: user.orgId,
      userId: user.id,
    });

    return { success: { data: true, message: t("succeded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("failed") } };
  }
}

export async function resetPassword(
  data: ResetPasswordSchema,
  token: string
): Promise<ActionResult<boolean>> {
  const t = await getTranslations("ResetPassword");

  try {
    const queryResult = await db
      .select()
      .from(users)
      .innerJoin(userTokens, eq(users.id, userTokens.userId))
      .where(eq(userTokens.token, token));

    if (queryResult.length == 0) {
      throw new TokenError("notFound");
    }

    const user = User.fromProps(queryResult[0].users);
    const resetToken = Token.fromProps(queryResult[0].userTokens);

    resetToken.validate("reset-password");
    await user.resetPassword(data.password);

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          updatedAt: sql`NOW()`,
          password: await bcrypt.hash(data.password, 10),
        })
        .where(eq(users.id, user.id!));
      await tx
        .update(userTokens)
        .set({ updatedAt: sql`NOW()` })
        .where(eq(userTokens.id, resetToken.id!));
    });

    return { success: { data: true, message: t("succeded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("failed") } };
  }
}

export async function logout(): Promise<ActionResult<boolean>> {
  const t = await getTranslations("Login");
  try {
    deleteSession();
    return { success: { data: true, message: t("logoutSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("logoutFailed") } };
  }
}
