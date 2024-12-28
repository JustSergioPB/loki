import * as z from "zod";

export const schemaSchema = z.object({
  title: z.string().min(1, { message: "required" }),
  description: z
    .string()
    .min(2, { message: "invalidDescriptionLength" })
    .max(255, { message: "invalidDescriptionLength" })
    .optional(),
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
});

export type SchemaSchema = z.infer<typeof schemaSchema>;
