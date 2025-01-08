"use server";

import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import { db } from "@/db";
import { didTable } from "@/db/schema/dids";
import { eq } from "drizzle-orm";
import { UuidDIDProvider } from "@/providers/did.provider";
import { auditLogTable } from "@/db/schema/audit-logs";
import { FakeHSMProvider } from "@/providers/key-pair.provider";
import { orgTable } from "@/db/schema/orgs";
import { Org } from "../models/org";

const BASE_URL = process.env.BASE_URL!;
const ROOT_ORG = process.env.ROOT_ORG_NAME!;
const keyPairProvider = new FakeHSMProvider();
const didProvider = new UuidDIDProvider(keyPairProvider, BASE_URL);

export async function createRootDID(): Promise<ActionResult<void>> {
  const t = await getTranslations("Did");
  try {
    const authUser = await authorize(["admin"]);

    const rootOrgQuery = await db
      .select()
      .from(orgTable)
      .where(eq(orgTable.name, ROOT_ORG));

    if (!rootOrgQuery[0]) {
      throw new Error("missingRootDID");
    }

    const rootOrg = Org.fromProps(rootOrgQuery[0]);
    const rootOrgDID = await didProvider.generateRootDID(rootOrg);

    await db.transaction(async (tx) => {
      const [insertedDID] = await tx
        .insert(didTable)
        .values({
          ...rootOrgDID.props,
          orgId: authUser.orgId,
        })
        .returning();
      await tx.insert(auditLogTable).values({
        entityId: insertedDID!.did,
        entityType: "root-did",
        value: insertedDID,
        orgId: authUser.orgId,
        userId: authUser.id,
        action: "create",
      });
    });

    return { success: { data: undefined, message: t("createSucceded") } };
  } catch (error) {
    console.error(error);
    return { error: { message: t("createFailed") } };
  }
}

export async function removeDID(id: string): Promise<ActionResult<void>> {
  const t = await getTranslations("DID");
  try {
    const authUser = await authorize(["admin"]);

    await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(didTable)
        .where(eq(didTable.did, id))
        .returning();
      await tx.insert(auditLogTable).values({
        entityId: id,
        entityType: "did",
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
