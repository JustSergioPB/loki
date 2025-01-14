import { DbOrg, orgTable } from "@/db/schema/orgs";
import { OrgError } from "../errors/org.error";
import { db } from "@/db";
import { eq, and, asc, count, or } from "drizzle-orm";
import { auditLogTable } from "@/db/schema/audit-logs";
import { AuthUser, userTable } from "@/db/schema/users";
import { createOrgDID, createUserDID } from "./did.model";
import { Query } from "../generics/query";
import { QueryResult } from "../generics/query-result";
import { emitDelegationProof } from "./auth.model";

export type CreateOrgProps = Pick<DbOrg, "name" | "tier">;

export async function createOrg(props: CreateOrgProps): Promise<DbOrg> {
  const [insertedOrg] = await db
    .insert(orgTable)
    .values({
      ...props,
      activeBridges: [],
      status: "verifying",
    })
    .returning();

  return insertedOrg;
}

export async function searchOrgs(query: Query): Promise<QueryResult<DbOrg>> {
  const queryResult = await db
    .select()
    .from(orgTable)
    .limit(query.pageSize)
    .offset(query.page * query.pageSize)
    .orderBy(asc(orgTable.createdAt));

  const [{ count: countResult }] = await db
    .select({ count: count() })
    .from(orgTable);

  return {
    items: queryResult,
    count: countResult,
  };
}

export async function getOrgById(id: string): Promise<DbOrg | null> {
  const orgQuery = await db.select().from(orgTable).where(eq(orgTable.id, id));
  return orgQuery[0] ?? null;
}

export async function deleteOrg(authUser: AuthUser, id: string): Promise<void> {
  await db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(orgTable)
      .where(eq(orgTable.id, id))
      .returning();
    await tx.insert(auditLogTable).values({
      entityId: id,
      entityType: "org",
      value: deleted,
      orgId: authUser.orgId,
      userId: authUser.id,
      action: "delete",
    });
  });
}

export async function verifyOrg(
  authUser: AuthUser,
  id: string
): Promise<DbOrg> {
  const queryResult = await db
    .select()
    .from(orgTable)
    .where(eq(orgTable.id, id))
    .innerJoin(
      userTable,
      and(
        eq(userTable.orgId, id),
        or(eq(userTable.role, "org-admin"), eq(userTable.role, "admin"))
      )
    );

  if (!queryResult[0]) {
    throw new OrgError("notFound");
  }

  const updatedOrg = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(orgTable)
      .set({ status: "verified", verifiedAt: new Date() })
      .where(eq(orgTable.id, queryResult[0].orgs.id))
      .returning();

    await tx.insert(auditLogTable).values([
      {
        entityId: updated.id,
        entityType: "org",
        value: updated,
        orgId: authUser.orgId,
        userId: authUser.id,
        action: "update",
      },
    ]);

    return updated;
  });

  const orgDID = await createOrgDID(id);
  const userDID = await createUserDID(orgDID, queryResult[0].users.id);

  await emitDelegationProof(
    queryResult[0].orgs.name,
    queryResult[0].users,
    orgDID,
    userDID
  );

  return updatedOrg;
}
