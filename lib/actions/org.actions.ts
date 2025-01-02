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
import { certificates } from "@/db/schema/certificates";
import { users } from "@/db/schema/users";
import { Certificate } from "../models/certificate";
import { CertificateError } from "../errors/certificate.error";
import { User } from "../models/user";

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

    const queryResult = await db
      .select()
      .from(orgs)
      .where(eq(orgs.id, id))
      .leftJoin(address, eq(address.orgId, id))
      .innerJoin(users, eq(users.orgId, id));

    if (!queryResult[0].orgs) {
      throw new OrgError("notFound");
    }

    const certQueryResult = await db.query.certificates.findFirst({
      where: eq(certificates.level, "root"),
    });

    if (!certQueryResult) {
      throw new CertificateError("rootNotFound");
    }

    const org = Org.fromProps({
      ...queryResult[0].orgs,
      address: queryResult[0].address ?? undefined,
    });

    const orgAdmin = User.fromProps(queryResult[0].users);

    org.verify();

    const rootCert = Certificate.fromProps(certQueryResult);
    const intermediateCert = Certificate.createIntermediate(org, rootCert);
    const endCert = Certificate.createEnd(org, intermediateCert);
    const userEndCert = Certificate.createEnd(org, intermediateCert, orgAdmin);

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(orgs)
        .set({ ...org.props })
        .where(eq(orgs.id, org.id!))
        .returning();

      const [orgInt, orgEnd, userEnd] = await tx
        .insert(certificates)
        .values([
          { ...intermediateCert.props, orgId: org.id! },
          { ...endCert.props, orgId: org.id! },
          { ...userEndCert.props, orgId: org.id!, userId: org.users[0].id },
        ])
        .returning();

      await tx.insert(auditLogs).values([
        {
          entityId: orgInt.id,
          entityType: "intermediate-certificate",
          value: orgInt,
          orgId: authUser.orgId,
          userId: authUser.id,
          action: "create",
        },
        {
          entityId: orgEnd.id,
          entityType: "org-end-certificate",
          value: orgEnd,
          orgId: authUser.orgId,
          userId: authUser.id,
          action: "create",
        },
        {
          entityId: userEnd.id,
          entityType: "user-end-certificate",
          value: userEnd,
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

export async function addAddressToOrg(
  data: AddressSchema
): Promise<ActionResult<void>> {
  const t = await getTranslations("Address");
  try {
    const authUser = await authorize(["admin", "org-admin"]);

    const queryResult = await db.query.orgs.findFirst({
      where: eq(orgs.id, authUser.orgId),
    });

    if (!queryResult) {
      throw new OrgError("notFound");
    }

    const org = Org.fromProps(queryResult);
    const newAddress = Address.create(data);

    org.addAddress(newAddress);

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(orgs)
        .set({ ...org.props })
        .where(eq(orgs.id, org.id!))
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
