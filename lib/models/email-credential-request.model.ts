import { DbCredentialRequest } from "@/db/schema/credential-request";
import { createCredentialRequest } from "./credential-request.model";
import { EmailBridgeRequestSchema } from "../schemas/email-bridge-request.schema";

export async function createEmailCredentialRequest(
  data: EmailBridgeRequestSchema
): Promise<DbCredentialRequest> {
  const credentialRequest = await createCredentialRequest(data.formVersionId, {
    claims: {
      email: data.sentTo,
    },
  });

  return credentialRequest;
}
