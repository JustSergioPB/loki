"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { UserSchema } from "../schemas/user.schema";
import { userTable } from "@/db/schema/users";
import { db } from "@/db";
import { User } from "../models/user";
import { authorize } from "../helpers/dal";
import { auditLogTable } from "@/db/schema/audit-logs";
import { and, eq } from "drizzle-orm";
import { UserError } from "../errors/user.error";
import { PasswordProvider } from "@/providers/password.provider";

//TODO: Add correct error messages on catch

export async function createUser(
  data: UserSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("User");
  try {
    const authUser = await authorize(["org-admin", "admin"]);
    const randomPassword = await PasswordProvider.random();
    const user = await User.create({ ...data, password: randomPassword });

    await db.transaction(async (tx) => {
      const [insertedUser] = await tx
        .insert(userTable)
        .values({
          ...user.props,
          orgId: authUser.orgId,
        })
        .returning();
      await tx.insert(auditLogTable).values({
        entityId: insertedUser.id,
        entityType: "user",
        value: insertedUser,
        orgId: authUser.orgId,
        userId: authUser.id,
        action: "create",
      });
    });

    //TODO send invitation email

    return { success: { data: undefined, message: t("createSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("createFailed") } };
  }
}

export async function updateUser(
  id: string,
  data: UserSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("User");
  try {
    const authUser = await authorize(["org-admin", "admin"]);
    const user = await db.query.userTable.findFirst({
      where: and(eq(userTable.id, id), eq(userTable.orgId, authUser.id)),
    });

    if (!user) {
      throw new UserError("notFound");
    }

    const updatedUser = User.fromProps(user);
    updatedUser.update(data);

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(userTable)
        .set({ ...updatedUser.props })
        .where(eq(userTable.id, id))
        .returning();

      await tx.insert(auditLogTable).values({
        entityId: id,
        entityType: "user",
        value: updated,
        orgId: authUser.orgId,
        userId: authUser.id,
        action: "update",
      });
    });

    return { success: { data: undefined, message: t("updateSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("updateFailed") } };
  }
}

export async function removeUser(id: string): Promise<ActionResult<void>> {
  const t = await getTranslations("User");
  try {
    const authUser = await authorize(["org-admin", "admin"]);

    await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(userTable)
        .where(
          and(
            eq(userTable.id, id),
            authUser.role === "admin"
              ? undefined
              : eq(userTable.orgId, authUser.id)
          )
        )
        .returning();
      await tx.insert(auditLogTable).values({
        entityId: id,
        entityType: "user",
        value: deleted,
        orgId: authUser.orgId,
        userId: authUser.id,
        action: "delete",
      });
    });

    return { success: { data: undefined, message: t("deleteSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("deleteFailed") } };
  }
}
