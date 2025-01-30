import { DbFormVersion, formVersionTable } from "@/db/schema/form-versions";
import { FormSchema } from "../schemas/form.schema";
import {
  CredentialSchema,
  CredentialSchemaProperties,
} from "../types/credential-schema";
import { AuthUser } from "@/db/schema/users";
import { db } from "@/db";
import { eq, asc, and, count } from "drizzle-orm";
import { auditLogTable } from "@/db/schema/audit-logs";
import { FormVersionStatus } from "../types/form";
import { FormVersionError } from "../errors/form-version.error";
import { Query } from "../generics/query";
import { QueryResult } from "../generics/query-result";

export async function createForm(
  authUser: AuthUser,
  data: FormSchema
): Promise<DbFormVersion> {
  const credentialSchema = buildCredentialSchema(data);

  return await db.transaction(async (tx) => {
    const [insertedFormVersion] = await tx
      .insert(formVersionTable)
      .values({
        title: data.title,
        credentialSchema,
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

export async function updateForm(
  authUser: AuthUser,
  id: string,
  data: FormSchema
): Promise<DbFormVersion> {
  const latestVersionQuery = await db
    .select()
    .from(formVersionTable)
    .where(eq(formVersionTable.id, id))
    .orderBy(asc(formVersionTable.createdAt))
    .limit(1);

  const credentialSchema = buildCredentialSchema(data);

  if (!latestVersionQuery[0] || latestVersionQuery[0].status !== "draft") {
    return await createFormVersion(
      authUser,
      latestVersionQuery[0].version,
      credentialSchema
    );
  }

  return await updateFormVersion(authUser, id, credentialSchema);
}

export async function getFormById(id: string): Promise<DbFormVersion | null> {
  return (
    (await db.query.formVersionTable.findFirst({
      where: eq(formVersionTable.id, id),
    })) ?? null
  );
}

export async function searchForms(
  query: Query<DbFormVersion>
): Promise<QueryResult<DbFormVersion>> {
  const { credentialSchema, status, orgId } = query;

  const formQuery = await db
    .select()
    .from(formVersionTable)
    .where(
      and(
        credentialSchema?.title
          ? eq(formVersionTable.title, credentialSchema?.title)
          : undefined,
        orgId ? eq(formVersionTable.orgId, orgId) : undefined,
        status ? eq(formVersionTable.status, status) : undefined
      )
    )
    .limit(query.pageSize)
    .offset(query.page * query.pageSize)
    .orderBy(asc(formVersionTable.createdAt));

  const [{ count: countResult }] = await db
    .select({ count: count() })
    .from(formVersionTable)
    .where(
      and(
        credentialSchema?.title
          ? eq(formVersionTable.title, credentialSchema?.title)
          : undefined,
        orgId ? eq(formVersionTable.orgId, orgId) : undefined,
        status ? eq(formVersionTable.status, status) : undefined
      )
    );

  return {
    items: formQuery,
    count: countResult,
  };
}

export async function publishForm(
  authUser: AuthUser,
  id: string
): Promise<DbFormVersion> {
  return await changeFormStatus(authUser, id, "published");
}

export async function archiveForm(
  authUser: AuthUser,
  id: string
): Promise<DbFormVersion> {
  return await changeFormStatus(authUser, id, "archived");
}

export async function deleteForm(
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

async function createFormVersion(
  authUser: AuthUser,
  prevVersion: number,
  credentialSchema: CredentialSchema
): Promise<DbFormVersion> {
  return await db.transaction(async (tx) => {
    const [insertedFormVersion] = await tx
      .insert(formVersionTable)
      .values({
        title: credentialSchema.title,
        credentialSchema,
        orgId: authUser.orgId,
        version: prevVersion + 1,
      })
      .returning();

    await tx.insert(auditLogTable).values([
      {
        entityId: insertedFormVersion.id,
        entityType: "formVersion",
        action: "create",
        userId: authUser.id,
        orgId: authUser.orgId,
        value: insertedFormVersion,
      },
    ]);

    return insertedFormVersion;
  });
}

async function updateFormVersion(
  authUser: AuthUser,
  id: string,
  credentialSchema: CredentialSchema
): Promise<DbFormVersion> {
  return await db.transaction(async (tx) => {
    const [updatedFormVersion] = await tx
      .update(formVersionTable)
      .set({
        title: credentialSchema.title,
        credentialSchema,
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
        value: {
          credentialSchema,
        },
      },
    ]);

    return updatedFormVersion;
  });
}

function buildCredentialSchema(props: FormSchema): CredentialSchema {
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
      const: props.title,
      type: "string",
    },
    type: {
      title: "type",
      type: "array",
      items: {
        title: "items",
        type: "string",
      },
      const: ["VerifiableCredential", ...props.type],
    },
    issuer: { title: "issuer", type: "string", format: "uri" },
    id: { title: "credentialID", type: "string", format: "uri" },
    credentialSubject: {
      title: "credentialSubject",
      properties: {
        id: {
          type: "string",
          pattern: "/^did:[a-z0-9]+:[a-zA-Z0-9_.%-]+(:[a-zA-Z0-9_.%-]+)*$/",
        },
        ...props.content.properties,
      },
      type: "object",
      required: ["id", ...props.content.required],
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

  if (props.validFrom) {
    required.push("validFrom");
    properties.validFrom = {
      const: props.validFrom.toISOString(),
      title: "validFrom",
      type: "string",
      format: "datetime",
    };
  }

  if (props.validUntil) {
    required.push("validUntil");
    properties.validUntil = {
      const: props.validUntil.toISOString(),
      title: "validUntil",
      type: "string",
      format: "datetime",
    };
  }

  if (props.description) {
    required.push("description");
    properties.description = {
      title: "description",
      const: props.description,
      type: "string",
    };
  }

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: props.title,
    description: props.description,
    properties,
    required,
    type: "object",
  };
}

async function changeFormStatus(
  authUser: AuthUser,
  id: string,
  status: FormVersionStatus
): Promise<DbFormVersion> {
  const latestVersionQuery = await db.query.formVersionTable.findFirst({
    where: eq(formVersionTable.id, id),
  });

  if (!latestVersionQuery) {
    throw new FormVersionError("latestVersionNotFound");
  }

  if (latestVersionQuery.status !== "draft" && status === "published") {
    throw new FormVersionError("cantBePublished");
  }

  return await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(formVersionTable)
      .set({
        status,
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
