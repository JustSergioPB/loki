import { DbDID, didTable, DIDWithOwner } from "@/db/schema/dids";
import { DIDDocument, VerificationMethod } from "../types/did";
import { db } from "@/db";
import { AuthUser, userTable } from "@/db/schema/users";
import { auditLogTable } from "@/db/schema/audit-logs";
import { eq, isNull, and, count, asc } from "drizzle-orm";
import { orgTable } from "@/db/schema/orgs";
import { OrgError } from "../errors/org.error";
import { generateKeyPair } from "./key.model";
import * as uuid from "uuid";
import { DIDError } from "../errors/did.error";
import { Query } from "../generics/query";
import { QueryResult } from "../generics/query-result";

const BASE_URL = process.env.BASE_URL!;

export async function createRootDID(authUser: AuthUser): Promise<DbDID> {
  const rootOrgQuery = await db
    .select()
    .from(orgTable)
    .where(eq(orgTable.name, process.env.ROOT_ORG_NAME!));

  if (!rootOrgQuery[0]) {
    throw new OrgError("rootNotFound");
  }

  const didDocument = await buildDocument("root");

  return await db.transaction(async (tx) => {
    const [insertedDID] = await tx
      .insert(didTable)
      .values({
        did: didDocument.controller,
        document: didDocument,
        orgId: authUser.orgId,
      })
      .returning();
    await tx.insert(auditLogTable).values({
      entityId: insertedDID.did,
      entityType: "root-did",
      value: insertedDID,
      orgId: authUser.orgId,
      userId: authUser.id,
      action: "create",
    });

    return insertedDID;
  });
}

export async function createOrgDID(orgId: string): Promise<DbDID> {
  const rootOrgQuery = await db
    .select()
    .from(orgTable)
    .where(eq(orgTable.name, process.env.ROOT_ORG_NAME!))
    .leftJoin(
      didTable,
      and(eq(didTable.orgId, orgTable.id), isNull(didTable.userId))
    );

  if (!rootOrgQuery[0]) {
    throw new OrgError("rootNotFound");
  }

  if (!rootOrgQuery[0].dids) {
    throw new DIDError("missingRootDID");
  }

  const didDocument = await buildDocument("org", [rootOrgQuery[0].dids.did]);

  const [insertedDID] = await db
    .insert(didTable)
    .values({
      did: didDocument.controller,
      document: didDocument,
      orgId,
    })
    .returning();

  return insertedDID;
}

export async function createUserDID(
  orgDID: DbDID,
  userId: string
): Promise<DbDID> {
  const didDocument = await buildDocument("user", [orgDID.did]);

  const [insertedDID] = await db
    .insert(didTable)
    .values({
      did: didDocument.controller,
      document: didDocument,
      orgId: orgDID.orgId,
      userId,
    })
    .returning();

  return insertedDID;
}

export async function searchDIDs(
  authUser: AuthUser,
  query: Query<DIDWithOwner>
): Promise<QueryResult<DIDWithOwner>> {
  const queryResult = await db
    .select()
    .from(didTable)
    .limit(query.pageSize)
    .offset(query.page * query.pageSize)
    .innerJoin(orgTable, eq(didTable.orgId, orgTable.id))
    .leftJoin(userTable, eq(didTable.userId, userTable.id))
    .orderBy(asc(didTable.createdAt));

  const [{ count: countResult }] = await db
    .select({ count: count() })
    .from(didTable);

  return {
    items: queryResult.map(({ orgs, users, dids }) => ({
      ...dids,
      org: orgs,
      user: users ?? undefined,
    })),
    count: countResult,
  };
}

export async function deleteDID(authUser: AuthUser, id: string): Promise<void> {
  await db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(didTable)
      .where(eq(didTable.did, id))
      .returning();
    await tx.insert(auditLogTable).values({
      entityId: id,
      entityType: "did",
      value: deleted,
      orgId: authUser.orgId,
      userId: authUser.id,
      action: "delete",
    });
  });
}

async function buildDocument(
  type: "root" | "org" | "user",
  additionalContollers: string[] = []
): Promise<DIDDocument> {
  const did = `did:uuid:${uuid.v7()}`;
  const baseUrl = `${BASE_URL}/dids/${did}`;
  const verificationMethodId = `${did}#key-0`;
  const publicKey = await generateKeyPair(verificationMethodId);

  const verificationMethods: VerificationMethod[] = [
    {
      ...publicKey,
      id: verificationMethodId,
      controllers: [did, ...additionalContollers],
    },
  ];

  const services = [
    {
      type: "KeyStatus",
      serviceEndpoint: `${baseUrl}/key-status`,
    },
    {
      type: "Profile",
      serviceEndpoint: `${baseUrl}/profile`,
    },
  ];

  if (type === "root") {
    services.push({
      type: "VerifiedOrganizations",
      serviceEndpoint: `${baseUrl}/verified-organizations`,
    });
  }

  if (type !== "user") {
    services.push({
      type: "CredentialStatus",
      serviceEndpoint: `${baseUrl}/credential-status`,
    });
  }

  return {
    id: `${did}`,
    controller: did,
    verificationMethod: verificationMethods,
    assertionMethod: [verificationMethods[0].id],
    service: services,
  };
}
