import { DbFormVersion, formVersionTable } from "@/db/schema/form-versions";
import { FormSchema } from "../schemas/form.schema";
import {
  CredentialSchema,
  CredentialSchemaProperties,
} from "../types/credential-schema";
import { AuthUser } from "@/db/schema/users";
import { formTable } from "@/db/schema/forms";
import { db } from "@/db";
import { eq, asc, and, count } from "drizzle-orm";
import { auditLogTable } from "@/db/schema/audit-logs";
import { FormVersionStatus } from "../types/form";
import { FormVersionError } from "../errors/form-version.error";
import { FormError } from "../errors/form.error";
import { Query } from "../generics/query";
import { QueryResult } from "../generics/query-result";

export async function createForm(
  authUser: AuthUser,
  data: FormSchema
): Promise<DbFormVersion> {
  const credentialSchema = buildCredentialSchema(data);

  return await db.transaction(async (tx) => {
    const [insertedForm] = await tx
      .insert(formTable)
      .values({
        title: data.title,
        orgId: authUser.orgId,
      })
      .returning();

    const [insertedFormVersion] = await tx
      .insert(formVersionTable)
      .values({
        credentialSchema,
        formId: insertedForm.id,
        orgId: authUser.orgId,
      })
      .returning();

    await tx.insert(auditLogTable).values([
      {
        entityId: insertedForm.id,
        entityType: "form",
        action: "create",
        userId: authUser.id,
        orgId: authUser.orgId,
        value: insertedForm,
      },
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

export async function updateForm(
  authUser: AuthUser,
  id: string,
  data: FormSchema
): Promise<DbFormVersion> {
  const latestVersionQuery = await db
    .select()
    .from(formVersionTable)
    .where(eq(formVersionTable.formId, id))
    .orderBy(asc(formVersionTable.createdAt))
    .limit(1);

  const credentialSchema = buildCredentialSchema(data);

  if (!latestVersionQuery[0] || latestVersionQuery[0].status !== "draft") {
    return await createFormVersion(authUser, id, credentialSchema);
  }

  return await updateFormVersion(
    authUser,
    latestVersionQuery[0],
    credentialSchema
  );
}

export async function getFormById(
  authUser: AuthUser,
  id: string
): Promise<DbFormVersion | null> {
  const queryResult = await db
    .select()
    .from(formTable)
    .where(and(eq(formTable.orgId, authUser.orgId), eq(formTable.id, id)))
    .innerJoin(formVersionTable, eq(formVersionTable.formId, id))
    .orderBy(asc(formVersionTable.createdAt));

  if (!queryResult[0]) {
    throw new FormError("notFound");
  }

  return queryResult[0].formVersions;
}

export async function searchForms(
  authUser: AuthUser,
  query: Query<DbFormVersion>
): Promise<QueryResult<DbFormVersion>> {
  const { credentialSchema, status } = query;

  const formQuery = await db
    .select()
    .from(formTable)
    .where(
      and(
        eq(formTable.orgId, authUser.orgId),
        credentialSchema?.title
          ? eq(formTable.title, credentialSchema?.title)
          : undefined
      )
    )
    .limit(query.pageSize)
    .offset(query.page * query.pageSize)
    .innerJoin(
      formVersionTable,
      and(
        eq(formVersionTable.formId, formTable.id),
        status ? eq(formVersionTable.status, status) : undefined
      )
    )
    .orderBy(asc(formVersionTable.createdAt));

  const [{ count: countResult }] = await db
    .select({ count: count() })
    .from(formTable)
    .where(eq(formTable.orgId, authUser.orgId));

  return {
    items: formQuery.map(({ formVersions }) => formVersions),
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
      .delete(formTable)
      .where(eq(formTable.id, id))
      .returning();

    await tx.insert(auditLogTable).values({
      entityId: id,
      entityType: "form",
      action: "delete",
      orgId: authUser.orgId,
      userId: authUser.id,
      value: deleted,
    });
  });
}

async function createFormVersion(
  authUser: AuthUser,
  id: string,
  credentialSchema: CredentialSchema
): Promise<DbFormVersion> {
  return await db.transaction(async (tx) => {
    await tx
      .update(formTable)
      .set({
        title: credentialSchema.title,
      })
      .where(eq(formTable.id, id));

    const [insertedFormVersion] = await tx
      .insert(formVersionTable)
      .values({
        credentialSchema,
        formId: id,
        orgId: authUser.orgId,
      })
      .returning();

    await tx.insert(auditLogTable).values([
      {
        entityId: id,
        entityType: "form",
        action: "update",
        userId: authUser.id,
        orgId: authUser.orgId,
        value: {
          title: credentialSchema.title,
        },
      },
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
  prevFormVersion: DbFormVersion,
  credentialSchema: CredentialSchema
): Promise<DbFormVersion> {
  return await db.transaction(async (tx) => {
    await tx
      .update(formTable)
      .set({
        title: credentialSchema.title,
      })
      .where(eq(formTable.id, prevFormVersion.formId));

    const [insertedFormVersion] = await tx
      .update(formVersionTable)
      .set({
        credentialSchema,
      })
      .where(eq(formVersionTable.id, prevFormVersion.id))
      .returning();

    await tx.insert(auditLogTable).values([
      {
        entityId: prevFormVersion.formId,
        entityType: "form",
        action: "update",
        userId: authUser.id,
        orgId: authUser.orgId,
        value: {
          title: credentialSchema.title,
        },
      },
      {
        entityId: prevFormVersion.id,
        entityType: "formVersion",
        action: "update",
        userId: authUser.id,
        orgId: authUser.orgId,
        value: {
          credentialSchema,
        },
      },
    ]);

    return insertedFormVersion;
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
        id: { type: "string", format: "uri" },
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
  const latestVersionQuery = await db
    .select()
    .from(formVersionTable)
    .where(eq(formVersionTable.formId, id))
    .orderBy(asc(formVersionTable.createdAt))
    .limit(1);

  if (!latestVersionQuery[0]) {
    throw new FormVersionError("latestVersionNotFound");
  }

  if (latestVersionQuery[0].status !== "draft" && status === "published") {
    throw new FormVersionError("cantBePublished");
  }

  return await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(formVersionTable)
      .set({
        status,
      })
      .where(eq(formVersionTable.id, latestVersionQuery[0].id))
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
