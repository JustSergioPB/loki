import * as z from "zod";

export const emailBridgeSchema = z.object({
  domains: z.array(z.string()),
});

export type EmailBridgeSchema = z.infer<typeof emailBridgeSchema>;
