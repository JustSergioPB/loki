import * as z from "zod";

export const addressSchema = z.object({
  location: z.string().optional(),
  stateProvince: z.string().optional(),
  country: z.string(),
});

export type AddressSchema = z.infer<typeof addressSchema>;
