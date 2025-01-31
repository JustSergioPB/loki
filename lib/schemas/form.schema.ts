import * as z from "zod";

export const formSchema = z.object({
  title: z.string().min(1, { message: "required" }),
  types: z.array(z.string()),
  description: z
    .string()
    .min(2, { message: "invalidDescriptionLength" })
    .max(255, { message: "invalidDescriptionLength" })
    .optional(),
  credentialSubject: z
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

export type FormSchema = z.infer<typeof formSchema>;
