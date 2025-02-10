import { credentialTable, DbCredential } from "@/db/schema/credentials";
import { db } from "@/db";
import { formVersionTable } from "@/db/schema/form-versions";
import { eq, and, asc, count } from "drizzle-orm";
import { didTable } from "@/db/schema/dids";
import { AuthUser, userTable } from "@/db/schema/users";
import { auditLogTable } from "@/db/schema/audit-logs";
import { DidError } from "../errors/did.error";
import { Query } from "../generics/query";
import { QueryResult } from "../generics/query-result";
import { CredentialError } from "../errors/credential.error";
import { challengeTable } from "@/db/schema/challenges";
import { FormVersionError } from "../errors/form-version.error";
import { getSignature } from "./key.model";
import { isPublished } from "../helpers/form-version.helper";
import { ChallengeSchema } from "../schemas/credential-challenge.schema";
import { ChallengeError } from "../errors/credential-request.error";
import { isBurned, isExpired } from "../helpers/credential-challenge.helper";
import { validateSignature } from "../helpers/key.helper";
import { DbPresentation, presentationTable } from "@/db/schema/presentations";
import { orgTable } from "@/db/schema/orgs";
import { toVerifiableCredential } from "../helpers/credential.helper";
import * as canonicalize from "json-canonicalize";
import { VerifiableCredentialProof } from "../types/verifiable-credential";
import { getSigningMethod } from "../helpers/did.helper";

//TODO: Add restrictions so a user can't emit a credential using another's org form version
export async function createCredential(
  formVersionId: string,
  authUser: AuthUser
): Promise<DbCredential> {
  const query = await db
    .select()
    .from(formVersionTable)
    .where(and(eq(formVersionTable.id, formVersionId)))
    .leftJoin(didTable, and(eq(didTable.userId, authUser.id)));

  if (!query[0]) {
    throw new FormVersionError("NOT_FOUND");
  }

  const { formVersions, dids } = query[0];

  if (!isPublished(formVersions)) {
    throw new FormVersionError("NOT_PUBLISHED");
  }

  if (!dids) {
    throw new DidError("USER_DID_NOT_FOUND");
  }

  return await db.transaction(async (tx) => {
    const [insertedCredential] = await tx
      .insert(credentialTable)
      .values({
        formVersionId,
        issuerId: dids.did,
        orgId: formVersions.orgId,
      })
      .returning();

    const [insertedChallenge] = await tx
      .insert(challengeTable)
      .values({
        orgId: formVersions.orgId,
        credentialId: insertedCredential.id,
      })
      .returning();

    await tx.insert(auditLogTable).values({
      entityId: insertedCredential.id,
      entityType: "credential",
      value: insertedCredential,
      orgId: authUser.orgId,
      userId: authUser.id,
      action: "create",
    });
    await tx.insert(auditLogTable).values({
      entityId: insertedChallenge.id,
      entityType: "challenge",
      value: insertedChallenge,
      orgId: authUser.orgId,
      userId: authUser.id,
      action: "create",
    });

    return insertedCredential;
  });
}

export async function createCredentialPresentation(
  id: string,
  challenge: ChallengeSchema
): Promise<DbCredential> {
  const query = await db.query.challengeTable.findFirst({
    where: eq(challengeTable.credentialId, id),
  });

  if (!query) {
    throw new ChallengeError("NOT_FOUND");
  }

  if (isBurned(query)) {
    throw new ChallengeError("IS_BURNT");
  }

  if (isExpired(query)) {
    throw new ChallengeError("IS_EXPIRED");
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
      //TODO: Patch this
      query.code!.toString()
    )
  );

  return db.transaction(async (tx) => {
    const [updatedChallenge] = await tx
      .update(challengeTable)
      .set({
        code: null,
      })
      .where(eq(challengeTable.id, query.id))
      .returning();

    const [updatedCredential] = await tx
      .update(credentialTable)
      .set({
        holder: challenge.holder.controller,
      })
      .where(eq(credentialTable.id, updatedChallenge.credentialId))
      .returning();

    let insertedPresentations: DbPresentation[] = [];

    if (insertedPresentations) {
      const presentations = challenge.presentations.map((p) => ({
        content: p.verifiablePresentation,
        credentialId: id,
        orgId: updatedCredential.orgId,
      }));
      insertedPresentations = await tx
        .insert(presentationTable)
        .values(presentations);
    }

    return updatedCredential;
  });
}

export async function updateCredential(
  id: string,
  data: Partial<Pick<DbCredential, "claims" | "validFrom" | "validUntil">>,
  authUser: AuthUser
): Promise<DbCredential> {
  return await db.transaction(async (tx) => {
    const [updatedCredential] = await tx
      .update(credentialTable)
      .set(data)
      .where(eq(credentialTable.id, id))
      .returning();

    await tx.insert(auditLogTable).values({
      entityId: updatedCredential.id,
      entityType: "credential",
      value: updatedCredential,
      orgId: authUser.orgId,
      userId: authUser.id,
      action: "update",
    });

    return updatedCredential;
  });
}

export async function signCredential(
  id: string,
  authUser: AuthUser
): Promise<DbCredential> {
  const BASE_URL = process.env.BASE_URL;

  if (!BASE_URL) {
    throw new Error("MISSING_BASE_URL");
  }

  const query = await db
    .select()
    .from(credentialTable)
    .where(eq(credentialTable.id, id))
    .innerJoin(orgTable, eq(orgTable.id, credentialTable.orgId))
    .innerJoin(didTable, eq(didTable.did, credentialTable.issuerId))
    .innerJoin(
      formVersionTable,
      eq(formVersionTable.id, credentialTable.formVersionId)
    );

  if (!query[0]) {
    throw new CredentialError("NOT_FOUND");
  }

  const { credentials, dids, orgs, formVersions } = query[0];

  if (!credentials.holder || !credentials.claims) {
    throw new Error("IMCOMPLETE");
  }

  const filledCredential = toVerifiableCredential(BASE_URL, {
    ...credentials,
    holder: credentials.holder,
    claims: credentials.claims,
    issuer: dids,
    org: orgs,
    formVersion: formVersions,
  });

  const verificationMethod = getSigningMethod(dids);

  const proof: VerifiableCredentialProof = {
    type: "DataIntegrityProof",
    created: new Date().toISOString(),
    cryptosuite: verificationMethod.type,
    verificationMethod: verificationMethod.id,
    proofPurpose: "assertionMethod",
    proofValue: "",
  };

  const signature = await getSignature(
    verificationMethod.id,
    canonicalize.canonicalize({ ...filledCredential, proof })
  );

  return await db.transaction(async (tx) => {
    const [updatedCredential] = await tx
      .update(credentialTable)
      .set({
        credential: {
          ...filledCredential,
          proof: {
            ...proof,
            proofValue: signature,
          },
        },
      })
      .where(eq(credentialTable.id, id))
      .returning();

    const [updatedChallenge] = await tx
      .update(challengeTable)
      .set({
        code: Math.floor(Math.random() * 1000000),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      })
      .where(eq(challengeTable.id, id));

    await tx.insert(auditLogTable).values({
      entityId: updatedCredential.id,
      entityType: "credential",
      value: updatedCredential,
      orgId: authUser.orgId,
      userId: authUser.id,
      action: "update",
    });

    return { ...updatedCredential, challenge: updatedChallenge };
  });
}

export async function claimCredential(
  id: string,
  challenge: ChallengeSchema
): Promise<DbCredential> {
  const query = await db
    .select()
    .from(credentialTable)
    .where(eq(credentialTable.id, id))
    .innerJoin(challengeTable, eq(challengeTable.credentialId, id));

  if (!query[0]) {
    throw new ChallengeError("NOT_FOUND");
  }

  const { credentials, challenges } = query[0];

  if (isBurned(challenges)) {
    throw new ChallengeError("IS_BURNT");
  }

  if (isExpired(challenges)) {
    throw new ChallengeError("IS_EXPIRED");
  }

  if (!credentials.credential) {
    throw new CredentialError("NOT_SIGNED");
  }

  validateSignature(
    challenge.holder,
    challenge.signature.label,
    challenge.signature.value,
    //TODO: Patch this
    challenges.code!.toString()
  );

  await db
    .update(challengeTable)
    .set({ code: null })
    .where(eq(challengeTable.id, challenges.id));

  return credentials;
}

export async function deleteCredential(
  authUser: AuthUser,
  id: string
): Promise<void> {
  await db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(credentialTable)
      .where(eq(credentialTable.id, id))
      .returning();
    await tx.insert(auditLogTable).values({
      entityId: id,
      entityType: "credential",
      value: deleted,
      orgId: authUser.orgId,
      userId: authUser.id,
      action: "delete",
    });
  });
}

export async function getCredentialById(
  id: string,
  authUser: AuthUser
): Promise<DbCredential | null> {
  const query = await db
    .select()
    .from(credentialTable)
    .where(
      and(eq(credentialTable.orgId, authUser.orgId), eq(credentialTable.id, id))
    )
    .innerJoin(
      formVersionTable,
      eq(credentialTable.formVersionId, formVersionTable.id)
    )
    .innerJoin(challengeTable, eq(challengeTable.credentialId, id));

  if (!query[0]) {
    return null;
  }

  const { formVersions, credentials, challenges } = query[0];

  return {
    ...credentials,
    formVersion: formVersions,
    challenge: challenges,
  };
}

export async function searchCredentials(
  authUser: AuthUser,
  query: Query<DbCredential>
): Promise<QueryResult<DbCredential>> {
  const queryResult = await db
    .select()
    .from(credentialTable)
    .where(eq(credentialTable.orgId, authUser.orgId))
    .limit(query.pageSize)
    .offset(query.page * query.pageSize)
    .orderBy(asc(credentialTable.createdAt))
    .innerJoin(
      formVersionTable,
      eq(credentialTable.formVersionId, formVersionTable.id)
    )
    .innerJoin(didTable, eq(didTable.did, credentialTable.issuerId))
    .leftJoin(userTable, eq(userTable.id, didTable.userId));

  const [{ count: countResult }] = await db
    .select({ count: count() })
    .from(credentialTable)
    .where(eq(credentialTable.orgId, authUser.orgId));

  return {
    items: queryResult.map(({ credentials, users, dids, formVersions }) => ({
      ...credentials,
      did: {
        ...dids,
        user: users,
      },
      formVersion: formVersions,
    })),
    count: countResult,
  };
}
