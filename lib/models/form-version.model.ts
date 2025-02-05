import { DbFormVersion, formVersionTable } from "@/db/schema/form-versions";
import { FormSchema } from "../schemas/form.schema";
import {
  CredentialSchema,
  CredentialSchemaProperties,
} from "../types/credential-schema";
import { AuthUser } from "@/db/schema/users";
import { db } from "@/db";
import { eq, asc, and, count, isNull, not } from "drizzle-orm";
import { auditLogTable } from "@/db/schema/audit-logs";
import { FormVersionStatus } from "../types/form-version";
import { FormVersionError } from "../errors/form-version.error";
import { Query } from "../generics/query";
import { QueryResult } from "../generics/query-result";
import { ValiditySchema } from "../schemas/validity.schema";
import { getFormVersionStatus } from "../helpers/form-version.helper";

export async function createFormVersion(
  authUser: AuthUser,
  data: FormSchema,
  version: number = 0
): Promise<DbFormVersion> {
  return await db.transaction(async (tx) => {
    const [insertedFormVersion] = await tx
      .insert(formVersionTable)
      .values({
        title: data.title,
        types: data.types,
        description: data.description,
        credentialSubject: data.credentialSubject,
        version,
        orgId: authUser.orgId,
      })
      .returning();

    await tx.insert(auditLogTable).values({
      entityId: insertedFormVersion.id,
      entityType: "formVersion",
      action: "create",
      userId: authUser.id,
      orgId: authUser.orgId,
      value: insertedFormVersion,
    });

    return insertedFormVersion;
  });
}

export async function updateFormVersionContent(
  authUser: AuthUser,
  id: string,
  data: FormSchema
): Promise<DbFormVersion> {
  const latestVersion = await db.query.formVersionTable.findFirst({
    where: eq(formVersionTable.id, id),
  });

  if (latestVersion && getFormVersionStatus(latestVersion) !== "draft") {
    return await createFormVersion(authUser, data, latestVersion.version + 1);
  }

  return await db.transaction(async (tx) => {
    const [updatedFormVersion] = await tx
      .update(formVersionTable)
      .set({
        title: data.title,
        types: data.types,
        description: data.description,
        credentialSubject: data.credentialSubject,
      })
      .where(eq(formVersionTable.id, id))
      .returning();

    await tx.insert(auditLogTable).values([
      {
        entityId: id,
        entityType: "formVersion",
        action: "update",
        userId: authUser.id,
        orgId: authUser.orgId,
        value: updatedFormVersion,
      },
    ]);

    return updatedFormVersion;
  });
}

export async function updateFormVersionValidity(
  authUser: AuthUser,
  id: string,
  data: ValiditySchema
) {
  return await db.transaction(async (tx) => {
    const [updatedFormVersion] = await tx
      .update(formVersionTable)
      .set(data)
      .where(eq(formVersionTable.id, id))
      .returning();

    await tx.insert(auditLogTable).values([
      {
        entityId: id,
        entityType: "formVersion",
        action: "update",
        userId: authUser.id,
        orgId: authUser.orgId,
        value: data,
      },
    ]);

    return updatedFormVersion;
  });
}

export async function getFormVersionById(
  id: string
): Promise<DbFormVersion | null> {
  return (
    (await db.query.formVersionTable.findFirst({
      where: eq(formVersionTable.id, id),
    })) ?? null
  );
}

export async function searchFormVersions(
  query: Query<DbFormVersion & { status: FormVersionStatus }>
): Promise<QueryResult<DbFormVersion>> {
  const { title, status, orgId } = query;

  const conditions = and(
    title ? eq(formVersionTable.title, title) : undefined,
    orgId ? eq(formVersionTable.orgId, orgId) : undefined,
    status === "draft" ? isNull(formVersionTable.credentialSchema) : undefined,
    status === "published"
      ? not(isNull(formVersionTable.credentialSchema))
      : undefined,
    status === "archived" ? eq(formVersionTable.isArchived, true) : undefined
  );

  const formQuery = await db
    .select()
    .from(formVersionTable)
    .where(conditions)
    .limit(query.pageSize)
    .offset(query.page * query.pageSize)
    .orderBy(asc(formVersionTable.createdAt));

  const [{ count: countResult }] = await db
    .select({ count: count() })
    .from(formVersionTable)
    .where(conditions);

  return {
    items: formQuery,
    count: countResult,
  };
}

export async function archiveFormVersion(
  authUser: AuthUser,
  id: string
): Promise<DbFormVersion> {
  const latestVersionQuery = await db.query.formVersionTable.findFirst({
    where: eq(formVersionTable.id, id),
  });

  if (!latestVersionQuery) {
    throw new FormVersionError("latestVersionNotFound");
  }

  if (getFormVersionStatus(latestVersionQuery) !== "published") {
    throw new FormVersionError("cantBeArchived");
  }

  return await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(formVersionTable)
      .set({
        isArchived: true,
      })
      .where(eq(formVersionTable.id, latestVersionQuery.id))
      .returning();

    await tx.insert(auditLogTable).values({
      entityId: id,
      entityType: "formVersion",
      action: "update",
      userId: authUser.id,
      orgId: authUser.orgId,
      value: updated,
    });

    return updated;
  });
}

export async function deleteFormVersion(
  authUser: AuthUser,
  id: string
): Promise<void> {
  await db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(formVersionTable)
      .where(eq(formVersionTable.id, id))
      .returning();

    await tx.insert(auditLogTable).values({
      entityId: id,
      entityType: "formVersion",
      action: "delete",
      orgId: authUser.orgId,
      userId: authUser.id,
      value: deleted,
    });
  });
}

export async function publishFormVersion(
  authUser: AuthUser,
  id: string
): Promise<DbFormVersion> {
  const latestVersionQuery = await db.query.formVersionTable.findFirst({
    where: eq(formVersionTable.id, id),
  });

  if (!latestVersionQuery) {
    throw new FormVersionError("latestVersionNotFound");
  }

  if (getFormVersionStatus(latestVersionQuery) !== "draft") {
    throw new FormVersionError("cantBePublished");
  }

  const credentialSchema = buildCredentialSchema(latestVersionQuery);

  return await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(formVersionTable)
      .set({
        credentialSchema,
      })
      .where(eq(formVersionTable.id, latestVersionQuery.id))
      .returning();

    await tx.insert(auditLogTable).values({
      entityId: id,
      entityType: "formVersion",
      action: "update",
      userId: authUser.id,
      orgId: authUser.orgId,
      value: updated,
    });

    return updated;
  });
}

function buildCredentialSchema(formVersion: DbFormVersion): CredentialSchema {
  const required = [
    "@context",
    "title",
    "type",
    "issuer",
    "credentialSubject",
    "credentialSchema",
  ];

  const properties: CredentialSchemaProperties = {
    "@context": {
      title: "context",
      type: "array",
      items: {
        title: "items",
        type: "string",
      },
      const: ["https://www.w3.org/ns/credentials/v2"],
    },
    title: {
      title: "title",
      const: formVersion.title,
      type: "string",
    },
    type: {
      title: "type",
      type: "array",
      items: {
        title: "items",
        type: "string",
      },
      const: ["VerifiableCredential", ...formVersion.types],
    },
    issuer: { title: "issuer", type: "string", format: "uri" },
    id: { title: "credentialID", type: "string", format: "uri" },
    credentialSubject: {
      title: "credentialSubject",
      properties: {
        id: {
          type: "string",
          title: "holder",
          pattern: "/^did:[a-z0-9]+:[a-zA-Z0-9_.%-]+(:[a-zA-Z0-9_.%-]+)*$/",
        },
        ...(formVersion.credentialSubject.properties ?? {}),
      },
      type: "object",
      required: ["id", ...(formVersion.credentialSubject.required ?? [])],
    },
    credentialSchema: {
      type: "object",
      title: "credentialSchema",
      properties: {
        id: { title: "id", type: "string", format: "uri" },
        type: { title: "Type", type: "string", const: "JsonSchema" },
      },
      required: ["id", "type"],
    },
    proof: {
      title: "psroof",
      properties: {
        type: {
          title: "Type",
          type: "string",
          const: "DataIntegrityProof",
        },
        cryptosuite: {
          title: "Cryptosuite",
          type: "string",
          enum: ["Ed25519Signature2020"],
        },
        created: {
          title: "created",
          type: "string",
          format: "datetime",
        },
        verificationMethod: {
          title: "verificationMethod",
          type: "string",
          format: "uri",
        },
        proofPurpose: {
          title: "proofPurpose",
          type: "string",
          const: "assertionMethod",
        },
        proofValue: {
          title: "proofValue",
          type: "string",
        },
      },
      required: [
        "type",
        "cryptosuite",
        "created",
        "verificationMethod",
        "proofPurpose",
        "proofValue",
      ],
      type: "object",
    },
  };

  if (formVersion.validFrom) {
    required.push("validFrom");
    properties.validFrom = {
      const: formVersion.validFrom.toISOString(),
      title: "validFrom",
      type: "string",
      format: "datetime",
    };
  }

  if (formVersion.validUntil) {
    required.push("validUntil");
    properties.validUntil = {
      const: formVersion.validUntil.toISOString(),
      title: "validUntil",
      type: "string",
      format: "datetime",
    };
  }

  if (formVersion.description) {
    required.push("description");
    properties.description = {
      title: "description",
      const: formVersion.description,
      type: "string",
    };
  }

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: formVersion.title,
    description: formVersion.description ?? undefined,
    properties,
    required,
    type: "object",
  };
}
