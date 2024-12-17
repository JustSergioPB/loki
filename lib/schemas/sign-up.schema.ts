import * as z from "zod";

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: "invalidFullNameLength" })
      .max(255, { message: "invalidFullNameLength" }),
    email: z.string().email({ message: "invalidEmail" }),
    orgName: z.string().min(2, { message: "invalidOrgNameLength" }),
    password: z
      .string()
      .min(8, { message: "invalidPasswordLength" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/,
        {
          message: "invalidPassword",
        }
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "passwordDontMatch",
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;
