import { credentialTable, DbCredential } from "@/db/schema/credentials";
import { VerifiableCredential } from "../types/verifiable-crendential";
import { db } from "@/db";
import { formTable } from "@/db/schema/forms";
import { DbFormVersion, formVersionTable } from "@/db/schema/form-versions";
import { eq, and, isNull, asc, count } from "drizzle-orm";
import { DbDID, didTable } from "@/db/schema/dids";
import { AuthUser, userTable } from "@/db/schema/users";
import { auditLogTable } from "@/db/schema/audit-logs";
import { FormVersionError } from "../errors/form-version.error";
import * as uuid from "uuid";
import { decryptVC, encryptVC, signVC } from "./key.model";
import { DIDError } from "../errors/did.error";
import { PlainCredential } from "../types/credential";
import { Query } from "../generics/query";
import { QueryResult } from "../generics/query-result";

type ClaimData = {
  claims: object;
  validFrom: Date | undefined;
  validUntil: Date | undefined;
};

export async function createCredential(
  formId: string,
  issuer: DbDID,
  holder: DbDID | string,
  data: ClaimData
): Promise<DbCredential> {
  const formVersionQuery = await db
    .select()
    .from(formVersionTable)
    .where(
      and(
        eq(formVersionTable.formId, formTable.id),
        eq(formVersionTable.status, "published")
      )
    );

  if (!formVersionQuery[0]) {
    throw new FormVersionError("publishedVersionNotFound");
  }

  const unsigned = await fillCredential(
    formVersionQuery[0],
    issuer,
    holder,
    data
  );

  const signed = await signVC(issuer.document.assertionMethod[0], unsigned);
  const encrypted = await encryptVC(issuer.document.assertionMethod[0], signed);

  const [insertedCredential] = await db
    .insert(credentialTable)
    .values({
      ...encrypted,
      formVersionId: formVersionQuery[0].id,
      holder: typeof holder === "string" ? holder : holder.did,
      orgId: issuer.orgId,
      userId: issuer.userId,
    })
    .returning();

  return insertedCredential;
}

export async function getCredentialById(
  authUser: AuthUser,
  id: string
): Promise<PlainCredential | null> {
  const queryResult = await db
    .select()
    .from(credentialTable)
    .where(
      and(eq(credentialTable.orgId, authUser.orgId), eq(credentialTable.id, id))
    )
    .innerJoin(
      didTable,
      and(eq(didTable.orgId, authUser.orgId), isNull(didTable.userId))
    );

  if (!queryResult[0]) {
    return null;
  }

  if (!queryResult[0].dids) {
    throw new DIDError("missingOrgDID");
  }

  const plainCredential = await decryptVC(
    queryResult[0].dids.document.assertionMethod[0],
    queryResult[0].credentials
  );

  return {
    ...queryResult[0].credentials,
    plainCredential,
  };
}

export async function searchCredentials(
  authUser: AuthUser,
  query: Query
): Promise<QueryResult<DbCredential>> {
  const queryResult = await db
    .select()
    .from(credentialTable)
    .where(eq(credentialTable.orgId, authUser.orgId))
    .limit(query.pageSize)
    .offset(query.page * query.pageSize)
    .orderBy(asc(credentialTable.createdAt))
    .leftJoin(userTable, eq(userTable.id, credentialTable.userId))
    .innerJoin(
      formVersionTable,
      eq(formVersionTable.id, credentialTable.formVersionId)
    );

  const [{ count: countResult }] = await db
    .select({ count: count() })
    .from(credentialTable)
    .where(eq(credentialTable.orgId, authUser.orgId));

  return {
    items: queryResult.map(({ credentials, users, formVersions }) => ({
      ...credentials,
      user: users ?? undefined,
      formVersion: formVersions,
    })),
    count: countResult,
  };
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
      orgId: authUser.id,
      userId: authUser.id,
      action: "delete",
    });
  });
}

export async function fillCredential(
  formVersion: DbFormVersion,
  issuer: DbDID,
  holder: DbDID | string,
  data: ClaimData
): Promise<VerifiableCredential> {
  const BASE_URL = process.env.BASE_URL!;

  return {
    "@context": formVersion.credentialSchema.properties["@context"].const,
    type: formVersion.credentialSchema.properties.type.const,
    id: `${BASE_URL}/credentials/${uuid.v7()}`,
    title: formVersion.credentialSchema.title,
    description: formVersion.credentialSchema.description,
    issuer: issuer.did,
    validFrom:
      data.validFrom?.toISOString() ??
      formVersion.credentialSchema.properties.validFrom?.const,
    validUntil:
      data.validUntil?.toISOString() ??
      formVersion.credentialSchema.properties.validUntil?.const,
    credentialSubject: {
      id: typeof holder === "string" ? holder : holder.did,
      ...data.claims,
    },
    credentialSchema: {
      id: `${BASE_URL}/forms/${formVersion.formId}/versions/${formVersion.id}`,
      type: formVersion.credentialSchema.properties.credentialSchema.properties
        .type.const,
    },
    proof: {
      type: formVersion.credentialSchema.properties.proof.properties.type.const,
      cryptosuite:
        formVersion.credentialSchema.properties.proof.properties.cryptosuite
          .const,
      created: new Date().toISOString(),
      verificationMethod: issuer.document.assertionMethod[0],
      proofPurpose:
        formVersion.credentialSchema.properties.proof.properties.proofPurpose
          .const,
      proofValue: undefined,
    },
  };
}
