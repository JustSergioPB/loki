import * as z from "zod";
import { userRoles } from "../models/user";

export const userSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "invalidFullNameLength" })
    .max(255, { message: "invalidFullNameLength" }),
  email: z.string().email({ message: "invalidEmail" }),
  role: z.enum(userRoles),
});

export type UserSchema = z.infer<typeof userSchema>;
