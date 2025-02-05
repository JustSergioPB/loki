import {
  credentialTable,
  CredentialWithIssuer,
  DbCredential,
} from "@/db/schema/credentials";
import { db } from "@/db";
import { DbFormVersion, formVersionTable } from "@/db/schema/form-versions";
import { eq, and, isNull, asc, count } from "drizzle-orm";
import { DbDID, didTable } from "@/db/schema/dids";
import { AuthUser, userTable } from "@/db/schema/users";
import { auditLogTable } from "@/db/schema/audit-logs";
import { DIDError } from "../errors/did.error";
import { Query } from "../generics/query";
import { QueryResult } from "../generics/query-result";
import * as canonicalize from "json-canonicalize";
import {
  SigningVerifiableCredential,
  VerifiableCredential,
} from "../types/verifiable-crendential";
import { DIDDocument } from "../types/did";
import { DbOrg, orgTable } from "@/db/schema/orgs";
import { CredentialError } from "../errors/credential.error";
import {
  credentialRequestTable,
  DbCredentialRequest,
} from "@/db/schema/credential-requests";
import { buildCredentialSchema } from "./form.model";
import { FormVersionError } from "../errors/form-version.error";
import * as uuid from "uuid";
import { ValiditySchema } from "../schemas/validity.schema";
import { CredentialSchema } from "../types/credential-schema";
import { getSignature } from "./key.model";
import getCredentialStatus from "../helpers/credential";

const BASE_URL = process.env.BASE_URL!;

//TODO: Add restrictions so a user can't emit a credential using another's org form version
export async function createCredential(
  formVersionId: string,
  authUser?: AuthUser,
  data?: object
): Promise<DbCredential> {
  const formVersionQuery = await db
    .select()
    .from(formVersionTable)
    .where(and(eq(formVersionTable.id, formVersionId)))
    .innerJoin(orgTable, eq(formVersionTable.orgId, orgTable.id))
    .leftJoin(
      didTable,
      and(
        eq(didTable.orgId, orgTable.id),
        authUser
          ? eq(didTable.userId, authUser.id)
          : and(eq(didTable.orgId, orgTable.id), isNull(didTable.userId))
      )
    );

  if (!formVersionQuery[0]) {
    throw new FormVersionError("notFound");
  }

  const { formVersions, dids, orgs } = formVersionQuery[0];

  if (formVersions.status !== "published") {
    throw new FormVersionError("notPublished");
  }

  if (!dids) {
    throw new DIDError("missingUserDID");
  }

  let credential: object | undefined;

  if (data) {
    const credentialSchema = buildCredentialSchema(formVersions);
    credential = buildCredential(
      orgs,
      formVersions,
      dids,
      data,
      credentialSchema
    );
  }

  return await db.transaction(async (tx) => {
    const [insertedCredential] = await tx
      .insert(credentialTable)
      .values({
        formVersionId,
        content: credential,
        issuerId: dids.did,
        orgId: formVersions.orgId,
      })
      .returning();

    if (authUser) {
      await tx.insert(auditLogTable).values({
        entityId: insertedCredential.id,
        entityType: "credential",
        value: insertedCredential,
        orgId: authUser.orgId,
        userId: authUser.id,
        action: "create",
      });
    }

    return insertedCredential;
  });
}

//TODO: Reevaluate if a credential can be created by an issuer and then signed by another using that user's keys
export async function updateCredentialContent(
  id: string,
  data: object,
  authUser: AuthUser
) {
  const credentialQuery = await db
    .select()
    .from(credentialTable)
    .where(and(eq(credentialTable.id, id)))
    .innerJoin(orgTable, eq(credentialTable.orgId, credentialTable.orgId))
    .innerJoin(
      formVersionTable,
      eq(credentialTable.formVersionId, formVersionTable.id)
    )
    .innerJoin(didTable, eq(credentialTable.issuerId, didTable.did));

  if (!credentialQuery[0]) {
    throw new CredentialError("notFound");
  }

  const { credentials, formVersions, dids, orgs } = credentialQuery[0];

  if (getCredentialStatus(credentials) === "signed") {
    throw new CredentialError("alreadySigned");
  }

  const credentialSchema = buildCredentialSchema(formVersions);
  const credential = buildCredential(
    orgs,
    formVersions,
    dids,
    data,
    credentialSchema
  );

  return await db.transaction(async (tx) => {
    const [updatedCredential] = await tx
      .update(credentialTable)
      .set({
        content: credential,
      })
      .where(eq(credentialTable.id, id))
      .returning();

    await tx.insert(auditLogTable).values({
      entityId: updatedCredential.id,
      entityType: "credential",
      value: updatedCredential,
      orgId: authUser.orgId,
      userId: authUser.id,
      action: "create",
    });

    return updatedCredential;
  });
}

export async function updateCredentialValidity(
  id: string,
  data: ValiditySchema,
  authUser: AuthUser
): Promise<DbCredential> {
  const credentialQuery = await db.query.credentialTable.findFirst({
    where: eq(credentialTable.id, id),
  });

  if (!credentialQuery) {
    throw new CredentialError("notFound");
  }

  if (getCredentialStatus(credentialQuery) === "signed") {
    throw new CredentialError("alreadySigned");
  }

  let content = credentialQuery.content;

  if (data.validFrom) {
    content = { ...content, validFrom: data.validFrom.toISOString() };
  }

  if (data.validUntil) {
    content = { ...content, validUntil: data.validUntil.toISOString() };
  }

  return await db.transaction(async (tx) => {
    const [updatedCredential] = await tx
      .update(credentialTable)
      .set({
        content,
      })
      .where(eq(credentialTable.id, id))
      .returning();

    await tx.insert(auditLogTable).values({
      entityId: updatedCredential.id,
      entityType: "credential",
      value: updatedCredential,
      orgId: authUser.orgId,
      userId: authUser.id,
      action: "create",
    });

    return updatedCredential;
  });
}

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

  const { credentialSubject, ...rest } = credentialQuery[0].credentials
    .content as VerifiableCredential;

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
      content: credential,
    })
    .where(eq(credentialTable.id, id))
    .returning();

  return [credential as VerifiableCredential, insertedCredential];
}

export async function getCredentialById(
  authUser: AuthUser,
  id: string
): Promise<DbCredential | null> {
  const credential = await db.query.credentialTable.findFirst({
    where: and(
      eq(credentialTable.orgId, authUser.orgId),
      eq(credentialTable.id, id)
    ),
  });

  if (!credential) {
    return null;
  }

  return credential;
}

export async function getCredentialByIdWithChallenge(
  authUser: AuthUser,
  id: string
): Promise<[DbCredential, DbCredentialRequest] | null> {
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

  return [queryResult[0].credentials, queryResult[0].credentialRequests];
}

export async function getCredentialByIdWithFormVersion(
  authUser: AuthUser,
  id: string
): Promise<[DbCredential, DbFormVersion] | null> {
  const queryResult = await db
    .select()
    .from(credentialTable)
    .where(
      and(eq(credentialTable.orgId, authUser.orgId), eq(credentialTable.id, id))
    )
    .innerJoin(
      formVersionTable,
      eq(credentialTable.formVersionId, formVersionTable.id)
    );

  if (!queryResult[0]) {
    return null;
  }

  return [queryResult[0].credentials, queryResult[0].formVersions];
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

function buildCredential(
  org: DbOrg,
  formVersion: DbFormVersion,
  issuer: DbDID,
  data: object,
  credentialSchema: CredentialSchema
) {
  return {
    "@context": credentialSchema.properties["@context"].const,
    type: credentialSchema.properties.type.const,
    id: `${BASE_URL}/credentials/${uuid.v7()}`,
    title: credentialSchema.title,
    description: credentialSchema.description,
    issuer: {
      name: org.name,
      id: `${BASE_URL}/dids/${issuer.document.controller}`,
    },
    credentialSubject: data,
    credentialSchema: {
      id: `${BASE_URL}/form/${formVersion.id}`,
      type: credentialSchema.properties.credentialSchema.properties?.type.const,
    },
  };
}
