import {
  credentialTable,
  CredentialWithIssuer,
  DbCredential,
} from "@/db/schema/credentials";
import { db } from "@/db";
import { formVersionTable } from "@/db/schema/form-versions";
import { eq, and, isNull, asc, count } from "drizzle-orm";
import { didTable } from "@/db/schema/dids";
import { AuthUser, userTable } from "@/db/schema/users";
import { auditLogTable } from "@/db/schema/audit-logs";
import { DIDError } from "../errors/did.error";
import { PlainCredential } from "../types/credential";
import { Query } from "../generics/query";
import { QueryResult } from "../generics/query-result";
import * as canonicalize from "json-canonicalize";
import { getSignature } from "../helpers/signature";
import {
  SigningVerifiableCredential,
  VerifiableCredential,
} from "../types/verifiable-crendential";
import { DIDDocument } from "../types/did";
import { orgTable } from "@/db/schema/orgs";
import { CredentialError } from "../errors/credential.error";
import {
  credentialRequestTable,
  DbCredentialRequest,
} from "@/db/schema/credential-requests";

export async function signCredential(
  id: string,
  holder: DIDDocument
): Promise<[VerifiableCredential, DbCredential]> {
  const credentialQuery = await db
    .select()
    .from(credentialTable)
    .where(eq(credentialTable.id, id))
    .innerJoin(didTable, eq(didTable.did, credentialTable.issuerId))
    .innerJoin(orgTable, eq(orgTable.id, didTable.orgId));

  if (!credentialQuery[0]) {
    throw new CredentialError("notFound");
  }

  const issuer = credentialQuery[0].dids;

  const verificationMethod = issuer.document.verificationMethod.find(
    (verificationMethod) =>
      verificationMethod.id === issuer.document.assertionMethod[0]
  );

  if (!verificationMethod) {
    throw new DIDError("missingAssertionMethod");
  }

  const { credentialSubject, ...rest } = JSON.parse(
    credentialQuery[0].credentials.encryptedContent
  );

  const credential: SigningVerifiableCredential = {
    ...rest,
    credentialSubject: {
      ...credentialSubject,
      id: holder.controller,
    },
    proof: {
      type: "DataIntegrityProof",
      created: new Date().toISOString(),
      cryptosuite: verificationMethod.type,
      verificationMethod: verificationMethod.id,
      proofPurpose: "assertionMethod",
    },
  };

  credential.proof.proofValue = await getSignature(
    issuer.document.assertionMethod[0],
    canonicalize.canonicalize(credential)
  );

  const [insertedCredential] = await db
    .update(credentialTable)
    .set({
      encryptedContent: JSON.stringify(credential),
      status: "signed",
    })
    .where(eq(credentialTable.id, id))
    .returning();

  return [credential as VerifiableCredential, insertedCredential];
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

  return {
    ...queryResult[0].credentials,
    plainCredential: JSON.parse(queryResult[0].credentials.encryptedContent),
  };
}

export async function getCredentialByIdWithChallenge(
  authUser: AuthUser,
  id: string
): Promise<[PlainCredential, DbCredentialRequest] | null> {
  const queryResult = await db
    .select()
    .from(credentialTable)
    .where(
      and(eq(credentialTable.orgId, authUser.orgId), eq(credentialTable.id, id))
    )
    .innerJoin(
      credentialRequestTable,
      eq(credentialRequestTable.credentialId, credentialTable.id)
    )
    .innerJoin(
      didTable,
      and(eq(didTable.orgId, authUser.orgId), isNull(didTable.userId))
    );

  if (!queryResult[0]) {
    return null;
  }

  return [
    {
      ...queryResult[0].credentials,
      plainCredential: JSON.parse(queryResult[0].credentials.encryptedContent),
    },
    queryResult[0].credentialRequests,
  ];
}

export async function searchCredentials(
  authUser: AuthUser,
  query: Query<CredentialWithIssuer>
): Promise<QueryResult<CredentialWithIssuer>> {
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
    items: queryResult.map(({ credentials, users, formVersions }) => ({
      ...credentials,
      issuer: users ?? undefined,
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
