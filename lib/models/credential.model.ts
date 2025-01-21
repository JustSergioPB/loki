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
import { decrypt, encrypt } from "./key.model";
import { DIDError } from "../errors/did.error";
import { PlainCredential } from "../types/credential";
import { Query } from "../generics/query";
import { QueryResult } from "../generics/query-result";
import * as canonicalize from "json-canonicalize";
import { getSignature } from "../helpers/signature";
import {
  SigningVerifiableCredential,
  UnsignedVerifiableCredential,
  VerifiableCredential,
} from "../types/verifiable-crendential";
import { DIDDocument } from "../types/did";
import {
  credentialRequestTable,
  CredentialRequestWithIssuer,
} from "@/db/schema/credential-request";

export async function createCredential(
  credentialRequest: CredentialRequestWithIssuer,
  unsignedCredential: UnsignedVerifiableCredential,
  holder: DIDDocument
): Promise<[VerifiableCredential, DbCredential]> {
  const { id: credentialRequestId, issuer } = credentialRequest;

  const verificationMethod = issuer.document.verificationMethod.find(
    (verificationMethod) =>
      verificationMethod.id === issuer.document.assertionMethod[0]
  );

  if (!verificationMethod) {
    throw new DIDError("missingAssertionMethod");
  }

  const { credentialSubject, ...rest } = unsignedCredential;

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

  const encrypted = await encrypt(
    issuer.document.assertionMethod[0],
    JSON.stringify(credential)
  );

  const [insertedCredential] = await db
    .insert(credentialTable)
    .values({
      encryptedContent: encrypted,
      credentialRequestId,
      orgId: issuer.orgId,
    })
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

  if (!queryResult[0].dids) {
    throw new DIDError("missingOrgDID");
  }

  const plainCredential = await decrypt(
    queryResult[0].dids.document.assertionMethod[0],
    queryResult[0].credentials.encryptedContent
  );

  return {
    ...queryResult[0].credentials,
    plainCredential: JSON.parse(plainCredential),
  };
}

export async function searchCredentials(
  authUser: AuthUser,
  query: Query
): Promise<QueryResult<CredentialWithIssuer>> {
  const queryResult = await db
    .select()
    .from(credentialTable)
    .where(eq(credentialTable.orgId, authUser.orgId))
    .limit(query.pageSize)
    .offset(query.page * query.pageSize)
    .orderBy(asc(credentialTable.createdAt))
    .innerJoin(
      credentialRequestTable,
      eq(credentialTable.credentialRequestId, credentialRequestTable.id)
    )
    .innerJoin(
      formVersionTable,
      eq(credentialRequestTable.formVersionId, formVersionTable.id)
    )
    .innerJoin(didTable, eq(didTable.did, credentialRequestTable.issuerId))
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
