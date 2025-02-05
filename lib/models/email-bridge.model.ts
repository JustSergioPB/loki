import { db } from "@/db";
import { auditLogTable } from "@/db/schema/audit-logs";
import { AuthUser } from "@/db/schema/users";
import { OrgError } from "../errors/org.error";
import { orgTable } from "@/db/schema/orgs";
import { eq, and, like } from "drizzle-orm";
import {
  Bridge,
  BRIDGE_CREDENTIAL_TYPE,
  BridgeType,
  bridgeTypes,
} from "../types/bridge";
import {
  createFormVersion,
  publishFormVersion,
  updateFormVersionContent,
} from "./form-version.model";
import { DbFormVersion, formVersionTable } from "@/db/schema/form-versions";
import { FormSchema } from "../schemas/form.schema";
import { FormVersionError } from "../errors/form-version.error";

const EMAIL_BRIDGE_TITLE = "Email bridge";

export async function createEmailBridge(
  authUser: AuthUser,
  domains: string[]
): Promise<DbFormVersion> {
  const orgQuery = await db
    .select()
    .from(orgTable)
    .where(eq(orgTable.id, authUser.orgId));

  if (!orgQuery[0]) {
    throw new OrgError("notFound");
  }

  const formVersion = await createFormVersion(
    authUser,
    buildForm(domains, orgQuery[0].name)
  );

  await publishFormVersion(authUser, formVersion.id);

  return formVersion;
}

export async function updateEmailBridge(
  authUser: AuthUser,
  domains: string[]
): Promise<DbFormVersion> {
  const orgQuery = await db
    .select()
    .from(orgTable)
    .where(eq(orgTable.id, authUser.orgId))
    .innerJoin(
      formVersionTable,
      and(
        eq(orgTable.id, formVersionTable.orgId),
        like(formVersionTable.title, EMAIL_BRIDGE_TITLE)
      )
    );

  if (!orgQuery[0]) {
    throw new OrgError("notFound");
  }

  if (!orgQuery[0].formVersions) {
    throw new FormVersionError("notFound");
  }

  const formVersion = await updateFormVersionContent(
    authUser,
    orgQuery[0].formVersions.id,
    buildForm(domains, orgQuery[0].orgs.name)
  );

  await publishFormVersion(authUser, formVersion.id);

  return formVersion;
}

export async function toggleEmailBridge(
  authUser: AuthUser,
  value: boolean
): Promise<void> {
  const bridgeQuery = await db
    .select()
    .from(orgTable)
    .where(eq(orgTable.id, authUser.orgId))
    .innerJoin(
      formVersionTable,
      and(
        eq(orgTable.id, formVersionTable.orgId),
        like(formVersionTable.title, EMAIL_BRIDGE_TITLE)
      )
    );

  if (!bridgeQuery[0]) {
    throw new OrgError("notFound");
  }

  if (value && !bridgeQuery[0].formVersions) {
    throw new FormVersionError("notFound");
  }

  if (value && bridgeQuery[0].orgs.activeBridges.includes("email")) {
    throw new Error("alreadyToggled");
  }

  let activeBridges: BridgeType[] = [];

  if (value) {
    activeBridges = [
      ...(bridgeQuery[0].orgs.activeBridges as BridgeType[]),
      "email",
    ];
  } else {
    const emailIndex = bridgeQuery[0].orgs.activeBridges.indexOf("email");
    bridgeQuery[0].orgs.activeBridges.splice(emailIndex, 1);
    activeBridges = [...bridgeQuery[0].orgs.activeBridges] as BridgeType[];
  }

  await db.transaction(async (tx) => {
    await tx
      .update(orgTable)
      .set({ activeBridges })
      .where(eq(orgTable.id, bridgeQuery[0].orgs.id));
    await tx.insert(auditLogTable).values({
      entityId: authUser.orgId,
      entityType: "org",
      value: { activeBridges },
      orgId: authUser.orgId,
      userId: authUser.id,
      action: "update",
    });
  });
}

export async function searchBridgesByOrg(orgId: string): Promise<Bridge[]> {
  const bridgeQuery = await db
    .select()
    .from(orgTable)
    .leftJoin(formVersionTable, eq(formVersionTable.orgId, orgId));

  return bridgeTypes.map((bridge) => ({
    active: bridgeQuery[0].orgs.activeBridges.includes(bridge),
    type: bridge,
    formVersion:
      bridgeQuery.find(({ formVersions }) =>
        formVersions?.types.includes(BRIDGE_CREDENTIAL_TYPE[bridge])
      )?.formVersions ?? undefined,
  }));
}

function buildForm(domains: string[], orgName: string): FormSchema {
  return {
    title: EMAIL_BRIDGE_TITLE,
    description: `This credential proves that the email belongs to ${orgName}`,
    types: ["Bridge", BRIDGE_CREDENTIAL_TYPE["email"]],
    credentialSubject: {
      properties: {
        email: {
          type: "string",
          format: "email",
          pattern: createEmailRegex(domains),
        },
      },
      required: ["email"],
    },
  };
}

function createEmailRegex(domains: string[]): string {
  // Validate input
  if (!domains.length) {
    throw new Error("At least one domain is required");
  }

  // Escape special characters in domains
  const escapedDomains = domains.map((domain) =>
    domain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );

  return `^[a-zA-Z0-9._%+-]+@(${escapedDomains.join("|")})$`;
}
