import { db } from "@/db";
import { OrgCreate, orgs } from "@/db/schema/orgs";
import {
  SchemaVersionCreate,
  schemaVersions,
} from "@/db/schema/schema-versions";
import { SchemaCreate, schemas } from "@/db/schema/schemas";
import { UserCreate, users } from "@/db/schema/users";
import { SchemaVersion } from "@/lib/models/schema-version";
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

function generateRandomSchema(orgId: number): SchemaCreate {
  return {
    title: faker.lorem.words(faker.number.int({ min: 1, max: 4 })),
    orgId,
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
  };
}

function generateRandomSchemaVersion(
  title: string,
  orgId: number,
  schemaId: number
): SchemaVersionCreate {
  return {
    content: SchemaVersion.create({
      title,
      description: faker.lorem.paragraph({ min: 1, max: 3 }),
      content: {
        type: "string",
        title: faker.animal.type(),
        format: faker.helpers.arrayElement([
          "email",
          "date",
          "datetime",
          "time",
          "uri",
        ]),
      },
    }).props.content,
    orgId,
    schemaId,
    status: faker.helpers.arrayElement(["archived", "published"]),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
  };
}

async function main() {
  await db.transaction(async (tx) => {
    const STACHELABS: OrgCreate = {
      name: process.env.ORG_NAME! as string,
      verifiedAt: faker.date.recent(),
    };

    const fakeOrgs = Array.from({ length: 10 }, () => generateRandomOrg());

    const insertedOrgs = await tx
      .insert(orgs)
      .values([STACHELABS, ...fakeOrgs])
      .returning();

    const stachelabsQuery = await tx.query.orgs.findFirst({
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

    await tx.insert(users).values([myUser, ...fakeUsers]);

    const fakeSchemas = Array.from({ length: 500 }, () =>
      generateRandomSchema(faker.helpers.arrayElement(insertedOrgs).id)
    );

    const insertedSchemas = await tx
      .insert(schemas)
      .values(fakeSchemas)
      .returning();

    const fakeSchemaVersions = insertedSchemas
      .map((schema) => {
        const arr = Array.from(
          { length: faker.number.int({ min: 1, max: 5 }) },
          () =>
            generateRandomSchemaVersion(schema.title, schema.orgId, schema.id)
        );

        if (Math.random() > 0.5) {
          arr[arr.length - 1].status = "draft";
        }
        return arr;
      })
      .reduce((acc, arr) => acc.concat(arr), []);

    await tx.insert(schemaVersions).values(fakeSchemaVersions);
  });

  exit(0);
}

main();
