import * as z from "zod";
import { DIDDocument } from "../types/did";

export const credentialChallengeSchema = z.object({
  signedChallenge: z
    .string()
    .min(1, { message: "requiredField" })
    .max(255, { message: "invalidLength" }),
  holder: z.custom<DIDDocument>(),
});

export type CredentialChallengeSchema = z.infer<
  typeof credentialChallengeSchema
>;
