import { db } from "@/db";
import {
  credentialRequestTable,
  DbCredentialRequest,
} from "@/db/schema/credential-requests";
import { and, eq } from "drizzle-orm";
import { CredentialRequestError } from "../errors/credential-request.error";
import { AuthUser } from "@/db/schema/users";
import { auditLogTable } from "@/db/schema/audit-logs";
import { credentialTable, DbCredential } from "@/db/schema/credentials";
import { CredentialError } from "../errors/credential.error";
import { CredentialChallengeSchema } from "../schemas/credential-challenge.schema";
import { isBurned, isExpired } from "../helpers/credential-challenge.helper";
import { validateSignature } from "../helpers/key.helper";
import { presentationTable } from "@/db/schema/presentations";
import { isUnsigned } from "../helpers/credential.helper";

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

export async function presentCredentialRequest(
  id: string,
  challenge: CredentialChallengeSchema
): Promise<[DbCredentialRequest, DbCredential]> {
  const query = await db
    .select()
    .from(credentialRequestTable)
    .where(eq(credentialRequestTable.id, id))
    .innerJoin(
      credentialTable,
      eq(credentialRequestTable.credentialId, credentialTable.id)
    );

  if (!query[0]) {
    throw new CredentialRequestError("notFound");
  }

  const { credentialRequests, credentials } = query[0];

  if (isBurned(credentialRequests)) {
    throw new CredentialRequestError("isBurnt");
  }

  if (isExpired(credentialRequests)) {
    throw new CredentialRequestError("isExpired");
  }

  if (!isUnsigned(credentials)) {
    throw new CredentialError("notUnsigned");
  }

  const signatures = [
    { holder: challenge.holder, signature: challenge.signature },
    ...challenge.presentations.map((p) => ({
      holder: p.holder,
      signature: p.signature,
    })),
  ];

  signatures.forEach(({ holder, signature }) =>
    validateSignature(
      holder,
      signature.label,
      signature.value,
      credentialRequests.code!.toString()
    )
  );

  return db.transaction(async (tx) => {
    const [updatedCredentialRequest] = await tx
      .update(credentialRequestTable)
      .set({
        code: null,
      })
      .where(eq(credentialRequestTable.id, id))
      .returning();

    const [updatedCredential] = await tx
      .update(credentialTable)
      .set({
        content: {
          ...credentials.content,
          id: challenge.holder.controller,
        },
      })
      .where(eq(credentialTable.id, updatedCredentialRequest.credentialId))
      .returning();

    if (challenge.presentations.length > 0) {
      const presentations = challenge.presentations.map((p) => ({
        content: p.verifiablePresentation,
        challengeId: updatedCredentialRequest.id,
      }));

      await tx.insert(presentationTable).values(presentations);
    }

    return [updatedCredentialRequest, updatedCredential];
  });
}
