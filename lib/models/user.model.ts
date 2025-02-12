import { UserSchema } from "../schemas/user.schema";
import { db } from "@/db";
import { AuthUser, DbUser, userTable } from "@/db/schema/users";
import { and, count, eq } from "drizzle-orm";
import { UserError } from "../errors/user.error";
import { auditLogTable } from "@/db/schema/audit-logs";
import * as bcrypt from "bcrypt";
import { Query } from "../generics/query";
import { QueryResult } from "../generics/query-result";
import { orgTable } from "@/db/schema/orgs";

export async function createUser(
  authUser: AuthUser,
  data: UserSchema
): Promise<DbUser> {
  const randomPassword = await bcrypt.hash(Math.random().toString(), 10);

  return await db.transaction(async (tx) => {
    const [insertedUser] = await tx
      .insert(userTable)
      .values({
        ...data,
        password: randomPassword,
        orgId: authUser.orgId,
      })
      .returning();
    await tx.insert(auditLogTable).values({
      entityId: insertedUser.id,
      entityType: "user",
      value: data,
      orgId: authUser.orgId,
      userId: authUser.id,
      action: "create",
    });

    return insertedUser;
  });
}

export async function updateUser(
  authUser: AuthUser,
  id: string,
  changes: Partial<DbUser>
): Promise<DbUser> {
  const user = await db.query.userTable.findFirst({
    where: and(eq(userTable.id, id), eq(userTable.orgId, authUser.id)),
  });

  if (!user) {
    throw new UserError("NOT_FOUND");
  }

  return await db.transaction(async (tx) => {
    const [updatedUser] = await tx
      .update(userTable)
      .set({ ...changes })
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
      value: changes,
      orgId: authUser.orgId,
      userId: authUser.id,
      action: "update",
    });

    return updatedUser;
  });
}

export async function banUser(authUser: AuthUser, id: string): Promise<DbUser> {
  return await updateUser(authUser, id, { status: "banned" });
}

export async function activateUser(
  authUser: AuthUser,
  id: string
): Promise<DbUser> {
  return await updateUser(authUser, id, { status: "banned" });
}

export async function deactivate(
  authUser: AuthUser,
  id: string
): Promise<DbUser> {
  return await updateUser(authUser, id, { status: "inactive" });
}

export async function searchUsers(
  authUser: AuthUser,
  query: Query<DbUser>
): Promise<QueryResult<DbUser>> {
  const queryResult = await db
    .select()
    .from(userTable)
    .limit(query.pageSize)
    .where(
      authUser.role === "admin"
        ? undefined
        : eq(userTable.orgId, authUser.orgId)
    )
    .offset(query.page * query.pageSize)
    .orderBy(userTable.orgId)
    .innerJoin(orgTable, eq(userTable.orgId, orgTable.id));

  const [{ count: countResult }] = await db
    .select({ count: count() })
    .from(userTable)
    .where(
      authUser.role === "admin"
        ? undefined
        : eq(userTable.orgId, authUser.orgId)
    );

  return {
    items: queryResult.map(({ users, orgs }) => ({
      ...users,
      org: orgs,
    })),
    count: countResult,
  };
}

export async function deleteUser(
  authUser: AuthUser,
  id: string
): Promise<void> {
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
}
