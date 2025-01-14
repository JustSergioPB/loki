import * as z from "zod";

export const emailBridgeRequestSchema = z.object({
  orgId: z
    .string()
    .uuid()
    .min(1, { message: "requiredField" })
    .max(255, { message: "invalidLength" }),
  formVersionId: z
    .string()
    .uuid()
    .min(1, { message: "requiredField" })
    .max(255, { message: "invalidLength" }),
  sentTo: z
    .string()
    .email()
    .min(1, { message: "requiredField" })
    .max(255, { message: "invalidLength" }),
});

export type EmailBridgeRequestSchema = z.infer<typeof emailBridgeRequestSchema>;

export const emailBridgeChallengeSchema = z.object({
  code: z.number(),
  signedChallenge: z
    .string()
    .min(1, { message: "requiredField" })
    .max(255, { message: "invalidLength" }),
  publicKey: z
    .string()
    .min(1, { message: "requiredField" })
    .max(255, { message: "invalidLength" }),
  holder: z
    .string()
    .min(1, { message: "requiredField" })
    .max(255, { message: "invalidLength" }),
});

export type EmailBridgeChallengeSchema = z.infer<
  typeof emailBridgeChallengeSchema
>;
