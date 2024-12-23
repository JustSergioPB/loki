import { db } from "@/db";
import { OrgCreate, orgs } from "@/db/schema/orgs";
import { UserCreate, users } from "@/db/schema/users";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { exit } from "process";

function generateRandomUser(orgId: number): UserCreate {
  return {
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    orgId: orgId,
    role: faker.helpers.arrayElement(["org-admin", "issuer"]),
    status: faker.helpers.arrayElement(["active", "inactive", "banned"]),
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    confirmedAt: faker.date.recent(),
  };
}

function generateRandomOrg(): OrgCreate {
  return {
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    name: faker.company.name(),
    verifiedAt: faker.date.recent(),
  };
}

async function main() {
  const STACHELABS: OrgCreate = {
    name: process.env.ORG_NAME! as string,
    verifiedAt: faker.date.recent(),
  };

  const fakeOrgs = Array.from({ length: 10 }, () => generateRandomOrg());

  const insertedOrgs = await db
    .insert(orgs)
    .values([STACHELABS, ...fakeOrgs])
    .returning();

  const stachelabsQuery = await db.query.orgs.findFirst({
    where: eq(orgs.name, process.env.ORG_NAME! as string),
  });

  const fakeUsers = Array.from({ length: 100 }, () =>
    generateRandomUser(faker.helpers.arrayElement(insertedOrgs).id)
  );

  const myUser: UserCreate = {
    orgId: stachelabsQuery!.id,
    role: "admin",
    status: "active",
    confirmedAt: faker.date.recent(),
    fullName: process.env.USER_FULLNAME! as string,
    email: process.env.USER_EMAIL! as string,
    password: process.env.USER_PASSWORD! as string,
  };

  await db.insert(users).values([myUser, ...fakeUsers]);

  exit(0);
}

main();
