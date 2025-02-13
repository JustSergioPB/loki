import * as z from "zod";

export const signatureSchema = z.object({
  label: z
    .string()
    .min(1, { message: "requiredField" })
    .max(255, { message: "invalidLength" }),
  value: z
    .string()
    .min(1, { message: "requiredField" })
    .max(255, { message: "invalidLength" }),
});

export type SignatureSchema = z.infer<typeof signatureSchema>;
