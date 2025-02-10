import * as z from "zod";
import { VerifiablePresentation } from "../types/verifiable-presentation";
import { signatureSchema } from "./signature.schema";
import { DIDDocument } from "../types/did";

export const challengeSchema = z.object({
  presentations: z
    .array(
      z.object({
        verifiablePresentation: z.custom<VerifiablePresentation>().optional(),
        signature: signatureSchema,
        holder: z.custom<DIDDocument>(),
      })
    )
    .min(1, "atLeastOneSignatureIsRequired"),
});

export type ChallengeSchema = z.infer<typeof challengeSchema>;
