"use server";

import { db } from "@/db";
import { auditLogTable } from "@/db/schema/audit-logs";
import { orgTable } from "@/db/schema/orgs";
import { and, eq, isNull } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import { Org } from "../models/org";
import { OrgError } from "../errors/org.error";
import { UuidDIDProvider } from "@/providers/did.provider";
import { userTable } from "@/db/schema/users";
import { User } from "../models/user";
import { didTable } from "@/db/schema/dids";

//TODO: Add correct error messages on catch

export async function removeOrg(id: string): Promise<ActionResult<void>> {
  const t = await getTranslations("Org");
  try {
    const authUser = await authorize(["admin"]);

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

    return { success: { data: undefined, message: t("deleteSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("deleteFailed") } };
  }
}

export async function verifyOrg(id: string): Promise<ActionResult<void>> {
  const t = await getTranslations("Org");

  try {
    const authUser = await authorize(["admin"]);

    const queryResult = await db
      .select()
      .from(orgTable)
      .where(eq(orgTable.id, id))
      .innerJoin(
        userTable,
        and(eq(userTable.orgId, id), eq(userTable.role, "org-admin"))
      );

    if (!queryResult[0]) {
      throw new OrgError("notFound");
    }

    const rootOrgQuery = await db
      .select()
      .from(orgTable)
      .where(eq(orgTable.name, process.env.ROOT_ORG_NAME!))
      .leftJoin(
        didTable,
        and(eq(didTable.orgId, orgTable.id), isNull(didTable.userId))
      );

    if(!rootOrgQuery[0]){
      throw new Error("missingRootOrg")
    }

    const rootOrg = Org.fromProps({
      ...rootOrgQuery[0].orgs,
      did: rootOrgQuery[0].dids ?? undefined,
    });

    const org = Org.fromProps(queryResult[0].orgs);
    const orgAdmin = User.fromProps(queryResult[0].users);
    const didProvider = new UuidDIDProvider();
    const orgDID = await didProvider.generateOrgDID(rootOrg, org);

    org.verify(orgDID);

    const userDID = await didProvider.generateUserDID(org, orgAdmin);

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(orgTable)
        .set({ ...org.props })
        .where(eq(orgTable.id, org.id!))
        .returning();

      const [insertedOrgDID, insertedUserDID] = await tx
        .insert(didTable)
        .values([
          { ...orgDID.props, orgId: org.id! },
          { ...userDID.props, orgId: org.id!, userId: orgAdmin.id },
        ])
        .returning();

      await tx.insert(auditLogTable).values([
        {
          entityId: insertedOrgDID.did,
          entityType: "org-did",
          value: insertedOrgDID,
          orgId: authUser.orgId,
          userId: authUser.id,
          action: "create",
        },
        {
          entityId: insertedUserDID.did,
          entityType: "user-did",
          value: insertedUserDID,
          orgId: authUser.orgId,
          userId: authUser.id,
          action: "create",
        },
        {
          entityId: updated.id,
          entityType: "org",
          value: updated,
          orgId: authUser.orgId,
          userId: authUser.id,
          action: "update",
        },
      ]);
    });

    return {
      success: { data: undefined, message: t("verificationSucceded") },
    };
  } catch (error) {
    console.error(error);
    return { error: { message: t("verificationFailed") } };
  }
}
