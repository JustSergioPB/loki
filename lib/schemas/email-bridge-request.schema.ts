import * as z from "zod";

export const emailBridgeRequestSchema = z.object({
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
