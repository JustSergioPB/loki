import * as z from "zod";
import { VerifiablePresentation } from "../types/verifiable-presentation";
import { signatureSchema } from "./signature.schema";
import { DIDDocument } from "../types/did";

export const credentialChallengeSchema = z.object({
  id: z.string().uuid().min(1, { message: "requiredField" }),
  signature: signatureSchema,
  holder: z.custom<DIDDocument>(),
  presentations: z.array(
    z.object({
      verifiablePresentation: z.custom<VerifiablePresentation>(),
      signature: signatureSchema,
      holder: z.custom<DIDDocument>(),
    })
  ),
});

export type CredentialChallengeSchema = z.infer<
  typeof credentialChallengeSchema
>;
