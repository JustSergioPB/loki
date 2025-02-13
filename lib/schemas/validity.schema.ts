import * as z from "zod";

export const validitySchema = z
  .object({
    validFrom: z.coerce.date().optional(),
    validUntil: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.validFrom && data.validUntil) {
        return data.validFrom.getTime() < data.validUntil.getTime();
      }

      return true;
    },
    {
      path: ["validFrom"],
      message: "validFromCantBeGreaterThanValidUntil",
    }
  );

export type ValiditySchema = z.infer<typeof validitySchema>;
