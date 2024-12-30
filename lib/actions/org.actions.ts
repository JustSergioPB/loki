"use server";

import { db } from "@/db";
import { auditLogs } from "@/db/schema/audit-logs";
import { orgs } from "@/db/schema/orgs";
import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import { AddressSchema } from "../schemas/address.schema";
import { address } from "@/db/schema/address";
import { OrgError } from "../errors/org.error";
import { Org } from "../models/org";
import { Address } from "../models/address";

//TODO: Add correct error messages on catch

export async function removeOrg(id: number): Promise<ActionResult<void>> {
  const t = await getTranslations("Org");
  try {
    const authUser = await authorize(["admin"]);

    await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(orgs)
        .where(eq(orgs.id, id))
        .returning();
      await tx.insert(auditLogs).values({
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

export async function verifyOrg(id: number): Promise<ActionResult<void>> {
  const t = await getTranslations("Org");
  try {
    const authUser = await authorize(["admin"]);

    const org = await db.query.orgs.findFirst({
      where: eq(orgs.id, id),
    });

    if (!org) {
      throw new OrgError("notFound");
    }

    const updatedOrg = Org.fromProps(org);
    updatedOrg.verify();

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(orgs)
        .set({ ...updatedOrg.props })
        .where(eq(orgs.id, updatedOrg.id!))
        .returning();
      await tx.insert(auditLogs).values({
        entityId: id,
        entityType: "org",
        value: updated,
        orgId: authUser.orgId,
        userId: authUser.id,
        action: "update",
      });
    });

    return {
      success: { data: undefined, message: t("verificationSucceded") },
    };
  } catch (error) {
    console.error(error);
    return { error: { message: t("verificationFailed") } };
  }
}

export async function addAddressToOrg(
  data: AddressSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("Address");
  try {
    const authUser = await authorize(["admin", "org-admin"]);

    const org = await db.query.orgs.findFirst({
      where: eq(orgs.id, authUser.orgId),
    });

    if (!org) {
      throw new OrgError("notFound");
    }

    const updatedOrg = Org.fromProps(org);
    const newAddress = Address.create(data);

    updatedOrg.addAddress(newAddress);

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(orgs)
        .set({ ...updatedOrg.props })
        .where(eq(orgs.id, updatedOrg.id!))
        .returning();

      const [inserted] = await tx
        .insert(address)
        .values({
          ...newAddress.props,
          orgId: authUser.id,
        })
        .returning();

      await tx.insert(auditLogs).values([
        {
          entityId: inserted.id,
          entityType: "address",
          value: inserted,
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
      success: { data: undefined, message: t("addressAdditionSucceded") },
    };
  } catch (error) {
    console.error(error);
    return { error: { message: t("addressAdditionFailed") } };
  }
}
