"use server";

import { db } from "@/db";
import { auditLogTable } from "@/db/schema/audit-logs";
import { orgTable } from "@/db/schema/orgs";
import { and, eq, isNull, like } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { ActionResult } from "../generics/action-result";
import { authorize } from "../helpers/dal";
import { Org } from "../models/org";
import { OrgError } from "../errors/org.error";
import { UuidDIDProvider } from "@/providers/did.provider";
import { userTable } from "@/db/schema/users";
import { User } from "../models/user";
import { didTable } from "@/db/schema/dids";
import { OrgDIDError } from "../errors/org-did.error";
import { OrgDID } from "../models/org-did";
import { formVersionTable } from "@/db/schema/form-versions";
import { formTable } from "@/db/schema/forms";
import { Form } from "../models/form";
import { FakeHSMProvider } from "@/providers/key-pair.provider";
import * as uuid from "uuid";
import { credentialTable } from "@/db/schema/credentials";

//TODO: Add correct error messages on catch
const BASE_URL = process.env.BASE_URL!;
const ROOT_ORG = process.env.ROOT_ORG_NAME!;
const DELEGATION_PROOF = process.env.DELEGATION_PROOF!;
const keyPairProvider = new FakeHSMProvider();
const didProvider = new UuidDIDProvider(keyPairProvider, BASE_URL);

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

    const org = Org.fromProps(queryResult[0].orgs);
    const orgAdmin = User.fromProps(queryResult[0].users);

    const rootOrgQuery = await db
      .select()
      .from(orgTable)
      .where(eq(orgTable.name, ROOT_ORG))
      .innerJoin(
        didTable,
        and(eq(didTable.orgId, orgTable.id), isNull(didTable.userId))
      )
      .innerJoin(
        formTable,
        and(
          eq(orgTable.id, formTable.orgId),
          like(formTable.title, DELEGATION_PROOF)
        )
      )
      .innerJoin(formVersionTable, eq(formTable.id, formVersionTable.formId));

    if (!rootOrgQuery[0]) {
      throw new OrgDIDError("missingRootDID");
    }

    const rootDID = await OrgDID.fromProps(rootOrgQuery[0].dids);
    const orgDID = await didProvider.generateOrgDID(rootDID);
    const userDID = await didProvider.generateUserDID(orgDID);
    const delegationProofForm = Form.fromProps({
      ...rootOrgQuery[0].forms,
      versions: [rootOrgQuery[0].formVersions],
    });

    const delegationProof = delegationProofForm.fill(
      {
        claims: { isAllowedToSign: true },
        validFrom: undefined,
        validUntil: undefined,
        id: `${BASE_URL}/${uuid.v7()}`,
      },
      BASE_URL,
      orgDID,
      userDID
    );

    const cypher = await keyPairProvider.signAndEncrypt(
      orgDID.signingLabel,
      delegationProof
    );

    org.verify();

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

      const [insertedDelegationProof] = await tx
        .insert(credentialTable)
        .values({
          ...cypher.props,
          formVersionId: delegationProofForm.latestVersion.id!,
          holder: userDID.props.did,
          orgId: org.id!,
        })
        .returning();

      await tx.insert(auditLogTable).values([
        {
          entityId: insertedOrgDID!.did,
          entityType: "org-did",
          value: insertedOrgDID,
          orgId: authUser.orgId,
          userId: authUser.id,
          action: "create",
        },
        {
          entityId: insertedUserDID!.did,
          entityType: "user-did",
          value: insertedUserDID,
          orgId: authUser.orgId,
          userId: authUser.id,
          action: "create",
        },
        {
          entityId: insertedDelegationProof!.id,
          entityType: "delegation-proof",
          value: insertedDelegationProof,
          orgId: authUser.orgId,
          userId: authUser.id,
          action: "create",
        },
        {
          entityId: updated!.id,
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
