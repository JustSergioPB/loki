import * as z from "zod";

export const confirmAccountSchema = z.object({
  title: z
    .string()
    .min(2, { message: "invalidTitleLength" })
    .max(255, { message: "invalidTitleLength" }),
});

export type ConfirmAccountSchema = z.infer<typeof confirmAccountSchema>;
