import { db } from "@/db";
import {
  credentialRequestTable,
  CredentialRequestWithIssuer,
  DbCredentialRequest,
} from "@/db/schema/credential-request";
import { formVersionTable } from "@/db/schema/form-versions";
import { FormVersionError } from "../errors/form-version.error";
import { decrypt, encrypt } from "./key.model";
import { UnsignedVerifiableCredential } from "../types/verifiable-crendential";
import * as uuid from "uuid";
import { and, eq, isNull } from "drizzle-orm";
import { CredentialChallengeSchema } from "../schemas/credential-challenge.schema";
import { CredentialRequestError } from "../errors/credential-request.error";
import { verifySignature } from "../helpers/signature";
import { didTable } from "@/db/schema/dids";
import { ClaimSchema } from "../schemas/claim.schema";
import { DIDError } from "../errors/did.error";
import { orgTable } from "@/db/schema/orgs";

const BASE_URL = process.env.BASE_URL!;

export async function createCredentialRequest(
  formVersionId: string,
  data: ClaimSchema
): Promise<DbCredentialRequest> {
  const formVersionQuery = await db
    .select()
    .from(formVersionTable)
    .where(and(eq(formVersionTable.id, formVersionId)))
    .innerJoin(orgTable, eq(orgTable.id, formVersionTable.orgId))
    .leftJoin(
      didTable,
      and(eq(didTable.orgId, formVersionTable.orgId), isNull(didTable.userId))
    );

  if (!formVersionQuery[0]) {
    throw new FormVersionError("notFound");
  }

  const {
    formVersions: { status, id, credentialSchema },
    dids,
    orgs,
  } = formVersionQuery[0];

  if (status !== "published") {
    throw new FormVersionError("notPublished");
  }

  if (!dids) {
    throw new DIDError("missingOrgDID");
  }

  //TODO: Add step to check if the claim matches the form
  const encryptionLabel = dids.document.assertionMethod[0];
  const credential = {
    "@context": credentialSchema.properties["@context"].const,
    type: credentialSchema.properties.type.const,
    id: `${BASE_URL}/credentials/${uuid.v7()}`,
    title: credentialSchema.title,
    description: credentialSchema.description,
    issuer: {
      name: orgs.name,
      id: dids.document.controller,
    },
    validFrom:
      data.validFrom?.toISOString() ??
      credentialSchema.properties.validFrom?.const,
    validUntil:
      data.validUntil?.toISOString() ??
      credentialSchema.properties.validUntil?.const,
    credentialSubject: {
      ...data.claims,
    },
    credentialSchema: {
      id: `${BASE_URL}/form-versions/${id}`,
      type: credentialSchema.properties.credentialSchema.properties.type.const,
    },
  };

  const encrypted = await encrypt(encryptionLabel, JSON.stringify(credential));

  const [insertedCredentialRequest] = await db
    .insert(credentialRequestTable)
    .values({
      encryptedContent: encrypted,
      issuerId: dids.document.controller,
      formVersionId: id,
      orgId: orgs.id,
    })
    .returning();

  return insertedCredentialRequest;
}

export async function validateCredentialRequest(
  id: string,
  challenge: CredentialChallengeSchema
): Promise<[UnsignedVerifiableCredential, CredentialRequestWithIssuer]> {
  const credentialRequestQuery = await db
    .select()
    .from(credentialRequestTable)
    .where(eq(credentialRequestTable.id, id))
    .innerJoin(didTable, eq(didTable.did, credentialRequestTable.issuerId));

  if (!credentialRequestQuery[0]) {
    throw new CredentialRequestError("notFound");
  }

  const {
    credentialRequests: { encryptedContent, expiresAt, code },
    dids: {
      document: { assertionMethod },
    },
  } = credentialRequestQuery[0];

  const { publicKeyMultibase, type } = challenge.holder.verificationMethod[0];

  if (!code || !encryptedContent) {
    throw new CredentialRequestError("isBurnt");
  }

  if (expiresAt < new Date()) {
    throw new CredentialRequestError("isExpired");
  }

  const isVerified = verifySignature(
    publicKeyMultibase,
    type,
    code.toString(),
    challenge.signedChallenge
  );

  if (isVerified) {
    throw new CredentialRequestError("invalidChallenge");
  }

  const decrypted = await decrypt(assertionMethod[0], encryptedContent);

  return [
    JSON.parse(decrypted),
    {
      ...credentialRequestQuery[0].credentialRequests,
      issuer: credentialRequestQuery[0].dids,
    },
  ];
}
