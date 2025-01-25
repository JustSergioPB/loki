import { DbCredentialRequest } from "@/db/schema/credential-request";
import { createCredentialRequest } from "./credential-request.model";
import { EmailBridgeRequestSchema } from "../schemas/email-bridge-request.schema";
import { DbCredential } from "@/db/schema/credentials";

export async function createEmailCredentialRequest(
  data: EmailBridgeRequestSchema
): Promise<[DbCredentialRequest, DbCredential]> {
  const result = await createCredentialRequest(data.formVersionId, {
    claims: {
      email: data.sentTo,
    },
    validFrom: undefined,
    validUntil: undefined,
  });

  //TODO: Send email with code

  return result;
}
