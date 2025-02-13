import { credentialTable, DbCredential } from "@/db/schema/credentials";
import { db } from "@/db";
import { formVersionTable } from "@/db/schema/form-versions";
import { eq, and, asc, count } from "drizzle-orm";
import { didTable } from "@/db/schema/dids";
import { AuthUser, userTable } from "@/db/schema/users";
import { auditLogTable } from "@/db/schema/audit-logs";
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
import { presentationTable } from "@/db/schema/presentations";
import { orgTable } from "@/db/schema/orgs";
import { toVerifiableCredential } from "../helpers/credential.helper";
import * as canonicalize from "json-canonicalize";
import { VerifiableCredentialProof } from "../types/verifiable-credential";
import { getSigningMethod } from "../helpers/did.helper";
import { SignatureError } from "../errors/signature.error";
import { DidError } from "../errors/did.error";

export async function createCredential(
  formVersionId: string,
  authUser: AuthUser
): Promise<DbCredential> {
  const query = await db.query.formVersionTable.findFirst({
    where: and(
      eq(formVersionTable.id, formVersionId),
      eq(formVersionTable.orgId, authUser.orgId)
    ),
  });

  if (!query) {
    throw new FormVersionError("NOT_FOUND");
  }

  if (!isPublished(query)) {
    throw new FormVersionError("NOT_PUBLISHED");
  }

  return await db.transaction(async (tx) => {
    const [insertedCredential] = await tx
      .insert(credentialTable)
      .values({
        formVersionId,
        orgId: query.orgId,
      })
      .returning();

    const [insertedChallenge] = await tx
      .insert(challengeTable)
      .values({
        orgId: query.orgId,
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

    return {
      ...insertedCredential,
      challenge: insertedChallenge,
      formVersion: query,
    };
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

  const valid = challenge.presentations
    .map(({ holder, signature }) =>
      validateSignature(
        holder,
        signature,
        //TODO: Patch this
        query.code!.toString()
      )
    )
    .every((valid) => valid);

  if (!valid) {
    throw new SignatureError("INVALID");
  }

  return await db.transaction(async (tx) => {
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
        holder: challenge.presentations[0].holder.controller,
        status: "presented",
      })
      .where(eq(credentialTable.id, updatedChallenge.credentialId))
      .returning();

    const presentations = challenge.presentations
      .filter((p) => p.verifiablePresentation)
      .map((p) => ({
        content: p.verifiablePresentation,
        credentialId: id,
        orgId: updatedCredential.orgId,
      }));

    if (presentations.length > 0) {
      await tx.insert(presentationTable).values(presentations);
    }

    return updatedCredential;
  });
}

export async function updateCredential(
  id: string,
  data: Partial<DbCredential>,
  authUser: AuthUser
): Promise<DbCredential> {
  const update: Partial<DbCredential> = {
    updatedAt: new Date(),
  };

  if (data.claims) update.claims = data.claims;
  if (data.validFrom) update.validFrom = data.validFrom;
  if (data.validUntil) update.validUntil = data.validUntil;
  if (
    data.status &&
    (data.status === "partiallyFilled" || data.status === "filled")
  )
    update.status = data.status;

  return await db.transaction(async (tx) => {
    const [updatedCredential] = await tx
      .update(credentialTable)
      .set(update)
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

//TODO: Update this once did is refactor so it checks for non revoked keys
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
    .innerJoin(
      formVersionTable,
      eq(formVersionTable.id, credentialTable.formVersionId)
    );

  if (!query[0]) {
    throw new CredentialError("NOT_FOUND");
  }

  const issuer = await db.query.didTable.findFirst({
    where: eq(didTable.userId, authUser.id),
  });

  if (!issuer) {
    throw new DidError("USER_DID_NOT_FOUND");
  }

  const { credentials, orgs, formVersions } = query[0];

  if (!credentials.holder || !credentials.claims) {
    throw new Error("IMCOMPLETE");
  }

  const filledCredential = toVerifiableCredential(BASE_URL, {
    ...credentials,
    holder: credentials.holder,
    claims: credentials.claims,
    issuer,
    org: orgs,
    formVersion: formVersions,
  });

  const verificationMethod = getSigningMethod(issuer);

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
        status: "signed",
        issuerId: issuer.did,
      })
      .where(eq(credentialTable.id, id))
      .returning();

    const updatedPresentations = await tx
      .update(presentationTable)
      .set({ content: null })
      .where(eq(presentationTable.credentialId, id))
      .returning();

    const [updatedChallenge] = await tx
      .update(challengeTable)
      .set({
        code: Math.floor(Math.random() * 1000000),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      })
      .where(eq(challengeTable.credentialId, id))
      .returning();

    await tx.insert(auditLogTable).values([
      {
        entityId: updatedCredential.id,
        entityType: "credential",
        value: updatedCredential,
        orgId: authUser.orgId,
        userId: authUser.id,
        action: "update",
      },
      {
        entityId: updatedChallenge.id,
        entityType: "challenge",
        value: updatedChallenge,
        orgId: authUser.orgId,
        userId: authUser.id,
        action: "update",
      },
    ]);

    return {
      ...updatedCredential,
      challenge: updatedChallenge,
      presentations: updatedPresentations,
    };
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

  const isValid = validateSignature(
    challenge.presentations[0].holder,
    challenge.presentations[0].signature,
    //TODO: Patch this
    challenges.code!.toString()
  );

  if (!isValid) {
    throw new SignatureError("INVALID");
  }

  return await db.transaction(async (tx) => {
    const [updatedCredential] = await tx
      .update(credentialTable)
      .set({ status: "claimed" })
      .where(eq(credentialTable.id, id))
      .returning();

    const [updatedChallenge] = await tx
      .update(challengeTable)
      .set({ code: null })
      .where(eq(challengeTable.id, challenges.id))
      .returning();

    return { ...updatedCredential, challenge: updatedChallenge };
  });
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
    .innerJoin(challengeTable, eq(challengeTable.credentialId, id))
    .leftJoin(presentationTable, eq(presentationTable.credentialId, id));

  if (!query[0]) {
    return null;
  }

  const { formVersions, credentials, challenges } = query[0];

  return {
    ...credentials,
    formVersion: formVersions,
    challenge: challenges,
    presentations: query
      .map(({ presentations }) => presentations)
      .filter((p) => !!p),
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
    .leftJoin(didTable, eq(didTable.did, credentialTable.issuerId))
    .leftJoin(userTable, eq(userTable.id, didTable.userId));

  const [{ count: countResult }] = await db
    .select({ count: count() })
    .from(credentialTable)
    .where(eq(credentialTable.orgId, authUser.orgId));

  return {
    items: queryResult.map(({ credentials, users, dids, formVersions }) => ({
      ...credentials,
      issuer: dids
        ? {
            ...dids,
            user: users ?? undefined,
          }
        : undefined,
      formVersion: formVersions,
    })),
    count: countResult,
  };
}
