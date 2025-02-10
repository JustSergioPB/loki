import { DbChallenge } from "@/db/schema/challenges";
import { EmailBridgeRequestSchema } from "../schemas/email-bridge-request.schema";

export async function createEmailChallenge(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  data: EmailBridgeRequestSchema
): Promise<DbChallenge> {
  throw new Error("NOT_IMPLEMENTED");
}
