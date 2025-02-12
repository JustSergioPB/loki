import { db } from "@/db";
import { challengeTable, DbChallenge } from "@/db/schema/challenges";
import { and, eq } from "drizzle-orm";
import { ChallengeError } from "../errors/credential-request.error";
import { AuthUser } from "@/db/schema/users";
import { auditLogTable } from "@/db/schema/audit-logs";
import { credentialTable } from "@/db/schema/credentials";
import { CredentialError } from "../errors/credential.error";
import { isBurned } from "../helpers/credential-challenge.helper";

export async function createChallenge(
  credentialId: string,
  authUser?: AuthUser
): Promise<DbChallenge> {
  const credential = await db.query.credentialTable.findFirst({
    where: eq(credentialTable.id, credentialId),
  });

  if (!credential) {
    throw new CredentialError("NOT_FOUND");
  }

  return await db.transaction(async (tx) => {
    const [insertedChallenge] = await tx
      .insert(challengeTable)
      .values({
        orgId: credential.orgId,
        credentialId,
      })
      .returning();

    if (authUser) {
      await tx.insert(auditLogTable).values({
        entityId: insertedChallenge.id,
        entityType: "challenge",
        value: insertedChallenge,
        orgId: authUser.orgId,
        userId: authUser.id,
        action: "create",
      });
    }

    return insertedChallenge;
  });
}

export async function renewChallenge(
  id: string,
  authUser?: AuthUser
): Promise<DbChallenge> {
  const challenge = await db.query.challengeTable.findFirst({
    where: and(
      eq(challengeTable.id, id),
      authUser ? eq(challengeTable.orgId, authUser.orgId) : undefined
    ),
  });

  if (!challenge) {
    throw new ChallengeError("NOT_FOUND");
  }

  if (isBurned(challenge)) {
    throw new ChallengeError("IS_BURNT");
  }

  return db.transaction(async (tx) => {
    const [updatedChallenge] = await tx
      .update(challengeTable)
      .set({
        code: Math.floor(Math.random() * 1000000),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      })
      .where(eq(challengeTable.id, id))
      .returning();

    if (authUser) {
      await tx.insert(auditLogTable).values([
        {
          entityId: updatedChallenge.id,
          entityType: "challenge",
          value: updatedChallenge,
          orgId: authUser.orgId,
          userId: authUser.id,
          action: "create",
        },
      ]);
    }

    return updatedChallenge;
  });
}
