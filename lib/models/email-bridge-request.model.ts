import { db } from "@/db";
import {
  DbEmailBridgeRequest,
  emailBridgeRequestTable,
} from "@/db/schema/email-bridge-request";
import {
  EmailBridgeChallengeSchema,
  EmailBridgeRequestSchema,
} from "../schemas/email-bridge-request.schema";
import { credentialTable } from "@/db/schema/credentials";
import { and, eq, isNull } from "drizzle-orm";
import { formVersionTable } from "@/db/schema/form-versions";
import { didTable } from "@/db/schema/dids";
import { FormVersionError } from "../errors/form-version.error";
import { DIDError } from "../errors/did.error";
import { fillCredential } from "./credential.model";
import { encryptVC, signVC } from "./key.model";
import { VerifiableCredential } from "../types/verifiable-crendential";
import { EmailBridgeRequestError } from "../errors/email-bridge-request.error";
import * as crypto from "crypto";

export async function createEmailBridgeRequest(
  data: EmailBridgeRequestSchema
): Promise<DbEmailBridgeRequest> {
  const [insertedRequest] = await db
    .insert(emailBridgeRequestTable)
    .values(data);
  return insertedRequest;
}

export async function verifyEmailBridgeRequestAndEmitVC(
  id: string,
  data: EmailBridgeChallengeSchema
): Promise<VerifiableCredential> {
  const query = await db
    .select()
    .from(emailBridgeRequestTable)
    .leftJoin(
      formVersionTable,
      eq(formVersionTable.id, emailBridgeRequestTable.formVersionId)
    )
    .leftJoin(
      didTable,
      and(
        eq(emailBridgeRequestTable.orgId, didTable.orgId),
        isNull(didTable.userId)
      )
    );

  if (!query[0]) {
    throw new EmailBridgeRequestError("notFound");
  }

  if (!query[0].formVersions) {
    throw new FormVersionError("notFound");
  }

  if (query[0].formVersions.status !== "published") {
    throw new FormVersionError("publishedVersionNotFound");
  }

  if (!query[0].dids) {
    throw new DIDError("missingOrgDID");
  }

  validateChallenge(data, query[0].emailBridgeRequests);

  const unsigned = await fillCredential(
    query[0].formVersions,
    query[0].dids,
    data.holder,
    {
      claims: {
        email: query[0].emailBridgeRequests.sentTo,
      },
      validFrom: undefined,
      validUntil: undefined,
    }
  );

  const signed = await signVC(
    query[0].dids.document.assertionMethod[0],
    unsigned
  );
  const encrypted = await encryptVC(
    query[0].dids.document.assertionMethod[0],
    signed
  );

  await db.transaction(async (tx) => {
    await tx
      .update(emailBridgeRequestTable)
      .set({ isBurnt: true })
      .where(eq(emailBridgeRequestTable.id, id));
    await db
      .insert(credentialTable)
      .values({
        ...encrypted,
        formVersionId: query[0].formVersions!.id,
        holder: data.holder,
        orgId: query[0].emailBridgeRequests.orgId,
      })
      .returning();
  });

  return signed;
}

function validateChallenge(
  data: EmailBridgeChallengeSchema,
  request: DbEmailBridgeRequest
): void {
  if (request.isBurnt) {
    throw new EmailBridgeRequestError("isBurnt");
  }

  if (new Date() > request.expiresAt) {
    throw new EmailBridgeRequestError("isExpired");
  }

  const verify = crypto.createVerify("SHA256");
  verify.update(request.code.toString());
  const isValid = verify.verify(
    data.publicKey,
    Buffer.from(data.signedChallenge, "hex")
  );

  if (!isValid) {
    throw new EmailBridgeRequestError("invalidChallenge");
  }
}
