"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { UserSchema } from "../schemas/user.schema";
import { users } from "@/db/schema/users";
import { db } from "@/db";
import { User } from "../models/user";
import { authorize } from "../helpers/dal";
import { auditLogs } from "@/db/schema/audit-logs";
import { and, eq } from "drizzle-orm";
import { UserError } from "../errors/user.error";

//TODO: Add correct error messages on catch

export async function createUser(
  data: UserSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("User");
  try {
    const authUser = await authorize(["org-admin", "admin"]);
    const user = await User.create(data);

    await db.transaction(async (tx) => {
      const [insertedUser] = await tx
        .insert(users)
        .values({
          ...user.props,
          orgId: authUser.orgId,
        })
        .returning();
      await tx.insert(auditLogs).values({
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
  id: number,
  data: UserSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("User");
  try {
    const authUser = await authorize(["org-admin", "admin"]);
    const user = await db.query.users.findFirst({
      where: and(eq(users.id, id), eq(users.orgId, authUser.id)),
    });

    if (!user) {
      throw new UserError("notFound");
    }

    const updatedUser = User.fromProps(user);
    updatedUser.update(data);

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(users)
        .set({ ...updatedUser.props })
        .where(eq(users.id, id))
        .returning();

      await tx.insert(auditLogs).values({
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

export async function removeUser(id: number): Promise<ActionResult<void>> {
  const t = await getTranslations("User");
  try {
    const authUser = await authorize(["org-admin", "admin"]);

    await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(users)
        .where(
          and(
            eq(users.id, id),
            authUser.role === "admin" ? undefined : eq(users.orgId, authUser.id)
          )
        )
        .returning();
      await tx.insert(auditLogs).values({
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
