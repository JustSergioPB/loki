import { DbPresentation, presentationTable } from "@/db/schema/presentations";
import { CredentialChallengeSchema } from "../schemas/credential-challenge.schema";
import { db } from "@/db";
import { credentialRequestTable } from "@/db/schema/credential-requests";
import { credentialTable } from "@/db/schema/credentials";
import { eq } from "drizzle-orm";
import { CredentialRequestError } from "../errors/credential-request.error";
import { CredentialError } from "../errors/credential.error";
import { isBurned, isExpired } from "../helpers/credential-challenge.helper";
import { isUnsigned } from "../helpers/credential.helper";
import { validateSignature } from "../helpers/key.helper";

export async function createPresentation(
  challenge: CredentialChallengeSchema
): Promise<[DbPresentation[], string]> {
  const query = await db
    .select()
    .from(credentialRequestTable)
    .where(eq(credentialRequestTable.id, challenge.id))
    .innerJoin(
      credentialTable,
      eq(credentialRequestTable.credentialId, credentialTable.id)
    );

  if (!query[0]) {
    throw new CredentialRequestError("notFound");
  }

  const { credentialRequests, credentials } = query[0];

  if (isBurned(credentialRequests)) {
    throw new CredentialRequestError("isBurnt");
  }

  if (isExpired(credentialRequests)) {
    throw new CredentialRequestError("isExpired");
  }

  if (!isUnsigned(credentials)) {
    throw new CredentialError("notUnsigned");
  }

  const signatures = [
    { holder: challenge.holder, signature: challenge.signature },
    ...challenge.presentations.map((p) => ({
      holder: p.holder,
      signature: p.signature,
    })),
  ];

  signatures.forEach(({ holder, signature }) =>
    validateSignature(
      holder,
      signature.label,
      signature.value,
      //TODO: Patch this
      credentialRequests.code!.toString()
    )
  );

  return db.transaction(async (tx) => {
    const [updatedCredentialRequest] = await tx
      .update(credentialRequestTable)
      .set({
        code: null,
      })
      .where(eq(credentialRequestTable.id, challenge.id))
      .returning();

    await tx
      .update(credentialTable)
      .set({
        content: {
          ...credentials.content,
          id: challenge.holder.controller,
        },
      })
      .where(eq(credentialTable.id, updatedCredentialRequest.credentialId));

    let insertedPresentations: DbPresentation[] = [];

    if (insertedPresentations) {
      const presentations = challenge.presentations.map((p) => ({
        content: p.verifiablePresentation,
        challengeId: updatedCredentialRequest.id,
      }));
      insertedPresentations = await tx
        .insert(presentationTable)
        .values(presentations);
    }

    return [insertedPresentations, credentialRequests.credentialId];
  });
}
