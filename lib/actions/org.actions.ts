"use server";

import { db } from "@/db";
import { AuditLogCreate, auditLogs } from "@/db/schema/audit-logs";
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
import { certificates } from "@/db/schema/certificates";
import { users } from "@/db/schema/users";

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

    const [{ orgs: org, address: orgAddress, users: orgUser }] = await db
      .select()
      .from(orgs)
      .where(eq(orgs.id, id))
      .leftJoin(address, eq(address.orgId, id))
      .innerJoin(users, eq(users.orgId, id));

    if (!org) {
      throw new OrgError("notFound");
    }

    const orgEntity = Org.fromProps({
      ...org,
      address: orgAddress ?? undefined,
      users: [orgUser],
      certificates: [],
    });

    orgEntity.verify();
    orgEntity.generateCertificateChain();

    const orgCertificates = orgEntity.certificates.map((cert) => ({
      ...cert.props,
      orgId: orgEntity.id!,
    }));

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(orgs)
        .set({ ...orgEntity.props })
        .where(eq(orgs.id, orgEntity.id!))
        .returning();

      const inserted = await tx
        .insert(certificates)
        .values(orgCertificates)
        .returning();

      const logs: AuditLogCreate[] = [
        {
          entityId: updated.id,
          entityType: "org",
          value: updated,
          orgId: authUser.orgId,
          userId: authUser.id,
          action: "update",
        },
      ];

      inserted.forEach((cert) =>
        logs.push({
          entityId: cert.id,
          entityType: "certificate",
          value: cert,
          orgId: authUser.orgId,
          userId: authUser.id,
          action: "create",
        })
      );

      await tx.insert(auditLogs).values(logs);
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

    const orgEntity = Org.fromProps(org);
    const newAddress = Address.create(data);

    orgEntity.addAddress(newAddress);

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(orgs)
        .set({ ...orgEntity.props })
        .where(eq(orgs.id, orgEntity.id!))
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
