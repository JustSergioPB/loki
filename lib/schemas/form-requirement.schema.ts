import * as z from "zod";

export const formRequirementSchema = z.object({
  requirementId: z.string().min(1, { message: "required" }),
  isRequired: z.boolean(),
});

export type FormRequirementSchema = z.infer<typeof formRequirementSchema>;
