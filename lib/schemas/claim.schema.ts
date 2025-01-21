import * as z from "zod";

export const claimSchema = z.object({
  claims: z.object({}),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
});

export type ClaimSchema = z.infer<typeof claimSchema>;
