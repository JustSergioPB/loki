import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { AuthUser, userTable } from "@/db/schema/users";
import { decrypt } from "./session";
import { AuthError } from "../errors/auth.error";

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/login");
  }

  return session
    ? { isAuth: true, userId: session.userId as string }
    : undefined;
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  try {
    return await db.query.userTable.findFirst({
      where: eq(userTable.id, session.userId),
      // Explicitly return the columns you need rather than the whole user object
      columns: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        orgId: true,
      },
    });
  } catch (error) {
    console.error(error);
    return null;
  }
});

export async function authorize(allowedRoles: string[]): Promise<AuthUser> {
  const user = await getUser();

  if (!user) {
    throw new AuthError("unauthorized");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new AuthError("forbidden");
  }

  return user;
}
