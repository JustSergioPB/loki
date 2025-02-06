import { db } from "@/db";
import {
  credentialRequestTable,
  DbCredentialRequest,
} from "@/db/schema/credential-requests";
import { and, eq } from "drizzle-orm";
import { CredentialRequestError } from "../errors/credential-request.error";
import { AuthUser } from "@/db/schema/users";
import { auditLogTable } from "@/db/schema/audit-logs";
import { credentialTable } from "@/db/schema/credentials";
import { CredentialError } from "../errors/credential.error";
import { isBurned } from "../helpers/credential-challenge.helper";

export async function createCredentialRequest(
  credentialId: string,
  authUser?: AuthUser
): Promise<DbCredentialRequest> {
  const credential = await db.query.credentialTable.findFirst({
    where: eq(credentialTable.id, credentialId),
  });

  if (!credential) {
    throw new CredentialError("notFound");
  }

  return await db.transaction(async (tx) => {
    const [insertedCredentialRequest] = await tx
      .insert(credentialRequestTable)
      .values({
        orgId: credential.orgId,
        credentialId,
      })
      .returning();

    if (authUser) {
      await tx.insert(auditLogTable).values({
        entityId: insertedCredentialRequest.id,
        entityType: "credentialRequest",
        value: insertedCredentialRequest,
        orgId: authUser.orgId,
        userId: authUser.id,
        action: "create",
      });
    }

    return insertedCredentialRequest;
  });
}

export async function renewCredentialRequest(
  id: string,
  authUser?: AuthUser
): Promise<DbCredentialRequest> {
  const credentialRequest = await db.query.credentialRequestTable.findFirst({
    where: and(
      eq(credentialRequestTable.id, id),
      authUser ? eq(credentialRequestTable.orgId, authUser.orgId) : undefined
    ),
  });

  if (!credentialRequest) {
    throw new CredentialRequestError("notFound");
  }

  if (isBurned(credentialRequest)) {
    throw new CredentialRequestError("isBurnt");
  }

  return db.transaction(async (tx) => {
    const [updatedCredentialRequest] = await tx
      .update(credentialRequestTable)
      .set({
        code: Math.floor(Math.random() * 1000000),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      })
      .where(eq(credentialRequestTable.id, id))
      .returning();

    if (authUser) {
      await tx.insert(auditLogTable).values([
        {
          entityId: updatedCredentialRequest.id,
          entityType: "credentialRequest",
          value: updatedCredentialRequest,
          orgId: authUser.orgId,
          userId: authUser.id,
          action: "create",
        },
      ]);
    }

    return updatedCredentialRequest;
  });
}
