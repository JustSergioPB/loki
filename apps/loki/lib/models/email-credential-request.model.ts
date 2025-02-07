import { DbCredentialRequest } from "@/db/schema/credential-requests";
import { createCredentialRequest } from "./credential-request.model";
import { EmailBridgeRequestSchema } from "../schemas/email-bridge-request.schema";
import { createCredential } from "./credential.model";

export async function createEmailCredentialRequest(
  data: EmailBridgeRequestSchema
): Promise<DbCredentialRequest> {
  const credential = await createCredential(data.formVersionId, undefined, {
    email: data.sentTo,
  });
  const result = await createCredentialRequest(credential.id);

  //TODO: Send email with code

  return result;
}
