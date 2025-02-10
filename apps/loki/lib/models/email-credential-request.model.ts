import { DbChallenge } from "@/db/schema/challenges";
import { createChallenge } from "./credential-request.model";
import { EmailBridgeRequestSchema } from "../schemas/email-bridge-request.schema";
import { createCredential } from "./credential.model";

export async function createEmailChallenge(
  data: EmailBridgeRequestSchema
): Promise<DbChallenge> {
  const credential = await createCredential(data.formVersionId, undefined, {
    email: data.sentTo,
  });
  const result = await createChallenge(credential.id);

  //TODO: Send email with code

  return result;
}
