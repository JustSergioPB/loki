import * as z from "zod";

export const schemaSchema = z
  .object({
    title: z.string().min(1, { message: "required" }),
    description: z
      .string()
      .min(2, { message: "invalidDescriptionLength" })
      .max(255, { message: "invalidDescriptionLength" })
      .optional(),
    validFrom: z.coerce.date().optional(),
    validUntil: z.coerce.date().optional(),
    content: z
      .string()
      .min(1, { message: "Title is required" })
      .refine((value) => {
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      })
      .transform((value) => JSON.parse(value)),
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

export type SchemaSchema = z.infer<typeof schemaSchema>;
