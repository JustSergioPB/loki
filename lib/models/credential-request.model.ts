import { db } from "@/db";
import {
  credentialRequestTable,
  DbCredentialRequest,
} from "@/db/schema/credential-requests";
import { and, eq } from "drizzle-orm";
import { CredentialChallengeSchema } from "../schemas/credential-challenge.schema";
import { CredentialRequestError } from "../errors/credential-request.error";
import { verifySignature } from "../helpers/signature";
import { AuthUser } from "@/db/schema/users";
import { auditLogTable } from "@/db/schema/audit-logs";
import { credentialTable } from "@/db/schema/credentials";
import { CredentialError } from "../errors/credential.error";

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

export async function validateCredentialRequest(
  id: string,
  challenge: CredentialChallengeSchema
): Promise<DbCredentialRequest> {
  const credentialRequestQuery = await db
    .select()
    .from(credentialRequestTable)
    .where(eq(credentialRequestTable.id, id));

  if (!credentialRequestQuery[0]) {
    throw new CredentialRequestError("notFound");
  }

  const { expiresAt, code } = credentialRequestQuery[0];
  const { publicKeyMultibase, type } = challenge.holder.verificationMethod[0];

  if (!code) {
    throw new CredentialRequestError("isBurnt");
  }

  if (expiresAt < new Date()) {
    throw new CredentialRequestError("isExpired");
  }

  const isVerified = verifySignature(
    publicKeyMultibase,
    type,
    code.toString(),
    challenge.signedChallenge
  );

  if (isVerified) {
    throw new CredentialRequestError("invalidChallenge");
  }

  const [updatedCredentialRequest] = await db
    .update(credentialRequestTable)
    .set({
      code: null,
    })
    .where(eq(credentialRequestTable.id, id))
    .returning();

  return updatedCredentialRequest;
}

export async function renewCredentialRequest(
  id: string,
  authUser?: AuthUser
): Promise<DbCredentialRequest> {
  const credentialRequestQuery = await db
    .select()
    .from(credentialRequestTable)
    .where(
      and(
        eq(credentialRequestTable.id, id),
        authUser ? eq(credentialRequestTable.orgId, authUser.orgId) : undefined
      )
    );

  if (!credentialRequestQuery[0]) {
    throw new CredentialRequestError("notFound");
  }

  const { code } = credentialRequestQuery[0];

  if (!code) {
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
