import * as z from "zod";

export const confirmAccountSchema = z.object({
  position: z
    .string()
    .min(2, { message: "invalidPositionLength" })
    .max(255, { message: "invalidPositionLength" }),
});

export type ConfirmAccountSchema = z.infer<typeof confirmAccountSchema>;
