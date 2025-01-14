import * as z from "zod";
import { userRoles } from "../types/user";

export const userSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "invalidFullNameLength" })
    .max(255, { message: "invalidFullNameLength" }),
  email: z.string().email({ message: "invalidEmail" }),
  position: z
    .string()
    .min(2, { message: "invalidPositionLength" })
    .max(255, { message: "invalidPositionLength" }),
  role: z.enum(userRoles),
});

export type UserSchema = z.infer<typeof userSchema>;
