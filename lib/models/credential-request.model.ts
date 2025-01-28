import { db } from "@/db";
import {
  credentialRequestTable,
  DbCredentialRequest,
} from "@/db/schema/credential-requests";
import { formVersionTable } from "@/db/schema/form-versions";
import { FormVersionError } from "../errors/form-version.error";
import * as uuid from "uuid";
import { and, eq, isNull } from "drizzle-orm";
import { CredentialChallengeSchema } from "../schemas/credential-challenge.schema";
import { CredentialRequestError } from "../errors/credential-request.error";
import { verifySignature } from "../helpers/signature";
import { didTable } from "@/db/schema/dids";
import { ClaimSchema } from "../schemas/claim.schema";
import { DIDError } from "../errors/did.error";
import { orgTable } from "@/db/schema/orgs";
import { credentialTable, DbCredential } from "@/db/schema/credentials";
import { AuthUser } from "@/db/schema/users";
import { auditLogTable } from "@/db/schema/audit-logs";

const BASE_URL = process.env.BASE_URL!;

export async function createCredentialRequest(
  formVersionId: string,
  data: ClaimSchema,
  authUser?: AuthUser
): Promise<[DbCredentialRequest, DbCredential]> {
  const formVersionQuery = await db
    .select()
    .from(formVersionTable)
    .where(and(eq(formVersionTable.id, formVersionId)))
    .innerJoin(orgTable, eq(orgTable.id, formVersionTable.orgId))
    .leftJoin(
      didTable,
      and(
        eq(didTable.orgId, formVersionTable.orgId),
        authUser ? eq(didTable.userId, authUser.id) : isNull(didTable.userId)
      )
    );

  if (!formVersionQuery[0]) {
    throw new FormVersionError("notFound");
  }

  const {
    formVersions: { status, id, credentialSchema },
    dids,
    orgs,
  } = formVersionQuery[0];

  if (status !== "published") {
    throw new FormVersionError("notPublished");
  }

  if (!dids) {
    throw new DIDError("missingOrgDID");
  }

  //TODO: Add step to check if the claim matches the form
  //const encryptionLabel = dids.document.assertionMethod[0];

  const credential = {
    "@context": credentialSchema.properties["@context"].const,
    type: credentialSchema.properties.type.const,
    id: `${BASE_URL}/credentials/${uuid.v7()}`,
    title: credentialSchema.title,
    description: credentialSchema.description,
    issuer: {
      name: orgs.name,
      id: `${BASE_URL}/dids/${dids.document.controller}`,
    },
    validFrom:
      data.validFrom?.toISOString() ??
      credentialSchema.properties.validFrom?.const,
    validUntil:
      data.validUntil?.toISOString() ??
      credentialSchema.properties.validUntil?.const,
    credentialSubject: {
      ...data.credentialSubject,
    },
    credentialSchema: {
      id: `${BASE_URL}/form-versions/${id}`,
      type: credentialSchema.properties.credentialSchema.properties?.type.const,
    },
  };

  return await db.transaction(async (tx) => {
    const [insertedCredential] = await tx
      .insert(credentialTable)
      .values({
        encryptedContent: JSON.stringify(credential),
        issuerId: dids.document.controller,
        formVersionId: id,
        orgId: orgs.id,
      })
      .returning();
    const [insertedCredentialRequest] = await tx
      .insert(credentialRequestTable)
      .values({
        orgId: orgs.id,
        credentialId: insertedCredential.id,
      })
      .returning();

    if (authUser) {
      await tx.insert(auditLogTable).values([
        {
          entityId: insertedCredential.id,
          entityType: "credential",
          value: insertedCredential,
          orgId: authUser.orgId,
          userId: authUser.id,
          action: "create",
        },
        {
          entityId: insertedCredentialRequest.id,
          entityType: "credentialRequest",
          value: insertedCredentialRequest,
          orgId: authUser.orgId,
          userId: authUser.id,
          action: "create",
        },
      ]);
    }

    return [insertedCredentialRequest, insertedCredential];
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
    .where(eq(credentialRequestTable.id, id));

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
