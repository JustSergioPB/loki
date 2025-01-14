import { TokenError } from "../errors/token.error";
import { AuthError } from "../errors/auth.error";
import { LoginSchema } from "../schemas/login.schema";
import { DbDID, didTable } from "@/db/schema/dids";
import { createUserDID } from "./did.model";
import { DbUserToken, userTokenTable } from "@/db/schema/user-tokens";
import { DbOrg, orgTable } from "@/db/schema/orgs";
import { OrgError } from "../errors/org.error";
import { and, eq, isNull, like, sql } from "drizzle-orm";
import { SignUpSchema } from "../schemas/sign-up.schema";
import { db } from "@/db";
import { DbUser, userTable } from "@/db/schema/users";
import { UserError } from "../errors/user.error";
import bcrypt from "bcrypt";
import { createCredential } from "./credential.model";
import { formTable } from "@/db/schema/forms";
import { FORMS } from "../consts/form.consts";
import { FormError } from "../errors/form.error";
import { UserTokenContext } from "../types/user-token";

export async function loginUser(data: LoginSchema): Promise<DbUser> {
  const queryResult = await db
    .select()
    .from(userTable)
    .where(eq(sql`lower(${userTable.email})`, data.email.toLowerCase()))
    .innerJoin(orgTable, eq(userTable.orgId, orgTable.id));

  if (queryResult.length == 0) {
    throw new UserError("notFound");
  }

  const passwordsMatch = bcrypt.compare(
    data.password,
    queryResult[0].users.password
  );

  if (!passwordsMatch) {
    throw new AuthError("invalidCredentials");
  }

  return {
    ...queryResult[0].users,
    org: queryResult[0].orgs,
  };
}

export async function signUpUser(
  data: SignUpSchema
): Promise<{ org: DbOrg; user: DbUser; userToken: DbUserToken }> {
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

  const encryptedPassword = await bcrypt.hash(data.password, 10);

  return await db.transaction(async (tx) => {
    const [insertedOrg] = await tx
      .insert(orgTable)
      .values({
        name: data.orgName,
        tier: "starter",
        activeBridges: [],
      })
      .returning();
    const [insertedUser] = await tx
      .insert(userTable)
      .values({
        ...data,
        password: encryptedPassword,
        role: "org-admin",
        status: "inactive",
        orgId: insertedOrg.id,
      })
      .returning();
    const [insertedUserToken] = await tx.insert(userTokenTable).values({
      context: "confirmation",
      orgId: insertedOrg.id,
      userId: insertedUser.id,
    });

    return {
      org: insertedOrg,
      user: insertedUser,
      userToken: insertedUserToken,
    };
  });
}

export async function resetUserPassword(
  token: string,
  password: string
): Promise<void> {
  const queryResult = await db
    .select()
    .from(userTable)
    .where(eq(userTokenTable.id, token))
    .innerJoin(userTokenTable, eq(userTable.id, userTokenTable.userId));

  if (!queryResult[0]) {
    throw new TokenError("notFound");
  }

  validateToken(queryResult[0].userTokens, "reset-password");

  const encryptedPassword = await bcrypt.hash(password, 10);

  await db.transaction(async (tx) => {
    await tx
      .update(userTable)
      .set({ password: encryptedPassword })
      .where(eq(userTable.id, queryResult[0].users.id));
    await tx
      .update(userTokenTable)
      .set({ isBurnt: true })
      .where(eq(userTokenTable.id, queryResult[0].userTokens.id));
  });
}

export async function confirmUserAccount(
  token: string,
  position: string
): Promise<DbUser> {
  const queryResult = await db
    .select()
    .from(userTable)
    .where(eq(userTokenTable.id, token))
    .innerJoin(orgTable, eq(userTable.orgId, orgTable.id))
    .innerJoin(userTokenTable, eq(userTable.id, userTokenTable.userId))
    .leftJoin(
      didTable,
      and(eq(orgTable.id, didTable.orgId), isNull(didTable.userId))
    );

  if (!queryResult[0]) {
    throw new TokenError("notFound");
  }

  validateToken(queryResult[0].userTokens, "confirmation");

  const user = await db.transaction(async (tx) => {
    const [updatedUser] = await tx
      .update(userTable)
      .set({ position, status: "active", confirmedAt: new Date() })
      .where(eq(userTable.id, queryResult[0].users.id))
      .returning();
    await tx
      .update(userTokenTable)
      .set({ isBurnt: true })
      .where(eq(userTokenTable.id, queryResult[0].userTokens.id));
    return updatedUser;
  });

  if (queryResult[0].dids) {
    const userDID = await createUserDID(
      queryResult[0].dids,
      queryResult[0].users.id
    );

    await emitDelegationProof(
      queryResult[0].orgs.name,
      queryResult[0].users,
      queryResult[0].dids,
      userDID
    );
  }

  return user;
}

export async function resendUserConfirmation(email: string): Promise<void> {
  const user = await db.query.userTable.findFirst({
    where: eq(sql`lower(${userTable.email})`, email.toLowerCase()),
  });

  if (!user) {
    throw new UserError("notFound");
  }

  await db.insert(userTokenTable).values({
    context: "confirmation",
    orgId: user.orgId,
    userId: user.id,
  });
}

export async function sendUserForgotPassword(email: string): Promise<void> {
  const user = await db.query.userTable.findFirst({
    where: eq(sql`lower(${userTable.email})`, email.toLowerCase()),
  });

  if (!user) {
    throw new UserError("notFound");
  }

  await db.insert(userTokenTable).values({
    context: "reset-password",
    orgId: user.orgId,
    userId: user.id,
  });
}

export async function emitDelegationProof(
  organization: string,
  user: {
    fullName: string;
    email: string;
  },
  issuerDID: DbDID,
  holderDID: DbDID
): Promise<void> {
  const delegationFormQuery = await db
    .select()
    .from(formTable)
    .where(like(formTable.title, FORMS[0].title));

  if (!delegationFormQuery[0]) {
    throw new FormError("delegationFormNotFound");
  }

  await createCredential(delegationFormQuery[0].id, issuerDID, holderDID, {
    claims: {
      organization,
      user,
    },
    validFrom: undefined,
    validUntil: undefined,
  });
}

function validateToken(token: DbUserToken, context: UserTokenContext): void {
  if (new Date() > token.expiresAt) {
    throw new TokenError("expired");
  }

  if (token.isBurnt) {
    throw new TokenError("burnt");
  }

  if (token.context !== context) {
    throw new TokenError("invalidContext");
  }
}
