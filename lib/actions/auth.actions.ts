"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { LoginSchema } from "../schemas/login.schema";
import { createSession, deleteSession } from "../helpers/session";
import { db } from "@/db";
import { userTable } from "@/db/schema/users";
import { orgTable } from "@/db/schema/orgs";
import { eq, isNull, sql, and, like } from "drizzle-orm";
import { SignUpSchema } from "../schemas/sign-up.schema";
import { UserError } from "../errors/user.error";
import { Org } from "../models/org";
import { User } from "../models/user";
import { OrgError } from "../errors/org.error";
import { Token } from "../models/token";
import { TokenError } from "../errors/token.error";
import { ResetPasswordSchema } from "../schemas/reset-password.schema";
import { userTokenTable } from "@/db/schema/user-tokens";
import { PasswordProvider } from "@/providers/password.provider";
import { AuthError } from "../errors/auth.error";
import { ConfirmAccountSchema } from "../schemas/confirm-account.schema";
import { didTable } from "@/db/schema/dids";
import { UuidDIDProvider } from "@/providers/did.provider";
import { OrgDID } from "../models/org-did";
import { UserDIDError } from "../errors/user-did.error";
import { FakeHSMProvider } from "@/providers/key-pair.provider";
import { formTable } from "@/db/schema/forms";
import { formVersionTable } from "@/db/schema/form-versions";
import { Form } from "../models/form";
import * as uuid from "uuid";
import { credentialTable } from "@/db/schema/credentials";

//TODO: Add correct error messages on catch

export async function login(data: LoginSchema): Promise<ActionResult<string>> {
  const t = await getTranslations("Login");

  try {
    const queryResult = await db
      .select()
      .from(userTable)
      .where(eq(sql`lower(${userTable.email})`, data.email.toLowerCase()))
      .innerJoin(orgTable, eq(userTable.orgId, orgTable.id));

    if (queryResult.length == 0) {
      throw new UserError("notFound");
    }

    const passwordsMatch = PasswordProvider.compare(
      data.password,
      queryResult[0].users.password
    );

    if (!passwordsMatch) {
      throw new AuthError("invalidCredentials");
    }

    let redirect: string = "/dashboard";

    if (queryResult[0].users.status === "inactive") {
      redirect = "/inactive";
    } else if (!queryResult[0].users.confirmedAt) {
      redirect = "/hall";
    } else if (queryResult[0].orgs.status === "onboarding") {
      redirect = "/onboarding";
    } else if (queryResult[0].orgs.status === "verifying") {
      redirect = "/verifying";
    }

    await createSession({
      userId: queryResult[0].users.id,
      redirect,
    });

    return { success: { data: redirect, message: t("succeded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("failed") } };
  }
}

export async function signUp(data: SignUpSchema): Promise<ActionResult<void>> {
  const t = await getTranslations("SignUp");

  try {
    const existingUser = await db.query.userTable.findFirst({
      where: eq(sql`lower(${userTable.email})`, data.email.toLowerCase()),
    });

    if (existingUser) {
      throw new UserError("alreadyExists");
    }

    const existingOrg = await db.query.orgTable.findFirst({
      where: eq(orgTable.name, data.orgName),
    });

    if (existingOrg) {
      throw new OrgError("alreadyExists");
    }

    const org = Org.create({ name: data.orgName, tier: "starter" });
    const encryptedPassword = await PasswordProvider.encrypt(data.password);
    const user = User.signUp({ ...data, password: encryptedPassword });
    const token = Token.create({ sentTo: data.email, context: "confirmation" });

    await db.transaction(async (tx) => {
      const [{ id: orgId }] = await tx
        .insert(orgTable)
        .values({
          ...org.props,
        })
        .returning();
      const [{ id: userId }] = await tx
        .insert(userTable)
        .values({
          ...user.props,
          orgId,
        })
        .returning();
      await tx.insert(userTokenTable).values({
        ...token.props,
        orgId,
        userId,
      });
    });

    return { success: { data: undefined, message: t("succeded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("failed") } };
  }
}

export async function confirmInvitation(
  token: string
): Promise<ActionResult<void>> {
  const t = await getTranslations("ConfirmInvitation");

  try {
    const queryResult = await db
      .select()
      .from(userTable)
      .innerJoin(userTokenTable, eq(userTable.id, userTokenTable.userId))
      .innerJoin(orgTable, eq(userTable.orgId, orgTable.id))
      .innerJoin(
        didTable,
        and(eq(didTable.orgId, orgTable.id), isNull(didTable.userId))
      )
      .where(eq(userTokenTable.token, token));

    if (!queryResult[0].dids) {
      throw new UserDIDError("missingOrgDID");
    }

    const user = User.fromProps(queryResult[0].users);
    const invitationToken = Token.fromProps(queryResult[0].userTokens);
    const org = Org.fromProps(queryResult[0].orgs);
    const orgDID = OrgDID.fromProps(queryResult[0].dids);
    const keyPairProvider = new FakeHSMProvider();
    const didProvider = new UuidDIDProvider(
      keyPairProvider,
      process.env.BASE_URL!
    );
    const userDID = await didProvider.generateUserDID(orgDID);

    if (!user.props.position) {
      throw new UserError("missingPosition");
    }

    invitationToken.burn("invitation");
    user.confirm(user.props.position);

    const delegationFormQuery = await db
      .select()
      .from(orgTable)
      .where(eq(orgTable.name, process.env.ROOT_ORG_NAME!))
      .innerJoin(
        formTable,
        and(
          eq(orgTable.id, formTable.orgId),
          like(formTable.title, process.env.DELEGATION_PROOF!)
        )
      )
      .innerJoin(formVersionTable, eq(formTable.id, formVersionTable.formId));

    if (!delegationFormQuery[0]) {
      throw new Error("missingDelegationForm");
    }

    const BASE_URL = process.env.BASE_URL!;
    const delegationProofForm = Form.fromProps({
      ...delegationFormQuery[0].forms,
      versions: [delegationFormQuery[0].formVersions],
    });

    const delegationProof = delegationProofForm.fill(
      {
        claims: { isAllowedToSign: true },
        validFrom: undefined,
        validUntil: undefined,
        id: `${BASE_URL!}/${uuid.v7()}`,
      },
      BASE_URL,
      orgDID,
      userDID
    );

    const cypher = await keyPairProvider.signAndEncrypt(
      orgDID.signingLabel,
      delegationProof
    );

    await db.transaction(async (tx) => {
      await tx
        .update(userTable)
        .set({ ...user.props })
        .where(eq(userTable.id, user.id!));
      await tx
        .insert(didTable)
        .values({ ...userDID.props, orgId: org.id!, userId: user.id });
      await tx.insert(credentialTable).values({
        ...cypher.props,
        formVersionId: delegationProofForm.latestVersion.id!,
        holder: userDID.props.did,
        orgId: org.id!,
      });
      await tx
        .update(userTokenTable)
        .set({ ...invitationToken.props })
        .where(eq(userTokenTable.token, invitationToken.props.token));
    });

    await createSession({
      userId: queryResult[0].users.id,
    });

    return { success: { data: undefined, message: t("succeded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("failed") } };
  }
}

export async function resendConfirmationMail(
  email: string
): Promise<ActionResult<void>> {
  const t = await getTranslations("ConfirmAccount");

  try {
    const user = await db.query.userTable.findFirst({
      where: eq(sql`lower(${userTable.email})`, email.toLowerCase()),
    });

    if (!user) {
      throw new UserError("notFound");
    }

    const token = Token.create({
      sentTo: email,
      context: "confirmation",
    });

    await db.insert(userTokenTable).values({
      ...token.props,
      orgId: user.orgId,
      userId: user.id,
    });

    //await this.mailProvider.sendConfirmation(user.email, insertedToken);

    return {
      success: { data: undefined, message: t("resendSucceded") },
    };
  } catch (error) {
    console.error(error);
    return { error: { message: t("resendFailed") } };
  }
}

export async function confirmAccount(
  data: ConfirmAccountSchema,
  token: string
): Promise<ActionResult<void>> {
  const t = await getTranslations("ConfirmAccount");

  try {
    const queryResult = await db
      .select()
      .from(userTable)
      .innerJoin(userTokenTable, eq(userTable.id, userTokenTable.userId))
      .innerJoin(orgTable, eq(userTable.orgId, orgTable.id))
      .where(eq(userTokenTable.token, token));

    if (queryResult.length == 0) {
      throw new TokenError("notFound");
    }

    const user = User.fromProps(queryResult[0].users);
    const confirmationToken = Token.fromProps(queryResult[0].userTokens);

    confirmationToken.burn("confirmation");
    user.confirm(data.position);

    await db.transaction(async (tx) => {
      await tx
        .update(userTable)
        .set({ ...user.props })
        .where(eq(userTable.id, user.id!));
      await tx
        .update(userTokenTable)
        .set({ ...confirmationToken.props })
        .where(eq(userTokenTable.id, confirmationToken.id!));
    });

    await createSession({
      userId: user.id!,
    });

    return { success: { data: undefined, message: t("succeded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("failed") } };
  }
}

export async function forgotPassword(
  email: string
): Promise<ActionResult<void>> {
  const t = await getTranslations("ForgotPassword");

  try {
    const user = await db.query.userTable.findFirst({
      where: eq(sql`lower(${userTable.email})`, email.toLowerCase()),
    });

    if (!user) {
      throw new UserError("notFound");
    }

    const token = Token.create({
      sentTo: user.email,
      context: "reset-password",
    });

    await db.insert(userTokenTable).values({
      ...token.props,
      orgId: user.orgId,
      userId: user.id,
    });

    return { success: { data: undefined, message: t("succeded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("failed") } };
  }
}

export async function resetPassword(
  data: ResetPasswordSchema,
  token: string
): Promise<ActionResult<void>> {
  const t = await getTranslations("ResetPassword");

  try {
    const queryResult = await db
      .select()
      .from(userTable)
      .innerJoin(userTokenTable, eq(userTable.id, userTokenTable.userId))
      .where(eq(userTokenTable.token, token));

    if (queryResult.length == 0) {
      throw new TokenError("notFound");
    }

    const user = User.fromProps(queryResult[0].users);
    const resetToken = Token.fromProps(queryResult[0].userTokens);

    resetToken.burn("reset-password");
    const encryptedPassword = await PasswordProvider.encrypt(data.password);
    user.resetPassword(encryptedPassword);

    await db.transaction(async (tx) => {
      await tx
        .update(userTable)
        .set({ ...user.props })
        .where(eq(userTable.id, user.id!));
      await tx
        .update(userTokenTable)
        .set({ ...resetToken.props })
        .where(eq(userTokenTable.id, resetToken.id!));
    });

    return { success: { data: undefined, message: t("succeded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("failed") } };
  }
}

export async function logout(): Promise<ActionResult<void>> {
  const t = await getTranslations("Login");
  try {
    deleteSession();
    return { success: { data: undefined, message: t("logoutSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("logoutFailed") } };
  }
}
