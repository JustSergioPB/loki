import { db } from "@/db";
import { DbCreateDID, didTable } from "@/db/schema/dids";
import { orgTable } from "@/db/schema/orgs";
import { schemaVersionTable } from "@/db/schema/schema-versions";
import { schemaTable } from "@/db/schema/schemas";
import { userTable } from "@/db/schema/users";
import { CreateOrgProps, Org } from "@/lib/models/org";
import { orgTierTypes, TIER_MAP } from "@/lib/models/org-tier";
import { Schema } from "@/lib/models/schema";
import { CreateUserProps, User, userRoles } from "@/lib/models/user";
import { UuidDIDProvider } from "@/providers/did.provider";
import { faker } from "@faker-js/faker";
import { exit } from "process";

type Tenant = {
  org: Org;
  users: User[];
  schemas: Schema[];
};

function generateRandomUser(): CreateUserProps {
  return {
    role: faker.helpers.arrayElement(userRoles.slice(1)),
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    position: faker.person.jobTitle(),
  };
}

function generateRandomOrg(): CreateOrgProps {
  return {
    name: faker.company.name(),
    tier: faker.helpers.arrayElement(orgTierTypes.slice(1)),
  };
}

function generateRandomSchemaVersion(): Schema {
  const randValidity = Math.random();
  const schema = Schema.create({
    title: faker.lorem.words({ min: 2, max: 4 }),
    description:
      Math.random() > 0.5
        ? faker.lorem.sentences({ min: 1, max: 3 })
        : undefined,
    validFrom: randValidity ? faker.date.recent() : undefined,
    validUntil: randValidity ? faker.date.future() : undefined,
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
  });
  const rand = Math.random();
  const latest = schema.getLatestVersion();

  if (rand > 0.4) {
    latest.publish();
  } else if (rand > 0.9) {
    latest.archive();
  }

  return schema;
}

async function generateStachelabs(): Promise<Tenant> {
  const org = Org.create({ name: process.env.ROOT_ORG_NAME!, tier: "unbound" });
  const user = User.create({
    email: process.env.USER_EMAIL!,
    fullName: process.env.USER_FULLNAME!,
    role: "admin",
    password: process.env.USER_PASSWORD!,
    position: faker.person.jobTitle(),
  });
  const didProvider = new UuidDIDProvider();
  const orgDID = await didProvider.generateOrgDID(org, org);
  const userDID = await didProvider.generateUserDID(org, user);

  org.verify(orgDID);
  user.confirm(user.props.position!, userDID);

  return {
    org,
    users: [user],
    schemas: Array.from(
      {
        length: faker.number.int({ min: 1, max: 20 }),
      },
      () => generateRandomSchemaVersion()
    ),
  };
}

async function generateTenant(rootOrg: Org): Promise<Tenant> {
  const org = Org.create(generateRandomOrg());
  const users: User[] = [User.signUp(generateRandomUser())];
  const schemas: Schema[] = [];
  const didProvider = new UuidDIDProvider();

  if (Math.random() > 0.4) {
    const orgDID = await didProvider.generateOrgDID(rootOrg, org);
    org.verify(orgDID);

    users.push(
      ...(await Promise.all(
        Array.from(
          {
            length: faker.number.int({
              min: 2,
              max: TIER_MAP[org.props.tier].users,
            }),
          },
          async () => {
            const user = User.create(generateRandomUser());
            const randStatus = Math.random();
            if (randStatus > 0.2) {
              const userDID = await didProvider.generateUserDID(org, user);
              user.confirm(user.props.position!, userDID);
            }
            if (randStatus > 0.7) {
              user.deactivate();
            }
            if (randStatus > 0.9) {
              user.ban();
            }
            return user;
          }
        )
      ))
    );

    schemas.push(
      ...Array.from(
        {
          length: faker.number.int({
            min: 1,
            max: TIER_MAP[org.props.tier].schemas,
          }),
        },
        () => generateRandomSchemaVersion()
      )
    );
  }

  return {
    org,
    users,
    schemas,
  };
}

async function main() {
  const rootTenant = await generateStachelabs();
  const tenants = [rootTenant];
  const randTenants = await Promise.all(
    Array.from({ length: 10 }, async () => await generateTenant(rootTenant.org))
  );
  tenants.push(...randTenants);

  await db.transaction(async (trx) => {
    await Promise.all(
      tenants.map(async (tenant) => {
        const [{ id: orgId }] = await trx
          .insert(orgTable)
          .values(tenant.org.props)
          .returning();

        const insertedUsers = await trx
          .insert(userTable)
          .values(tenant.users.map((u) => ({ ...u.props, orgId })))
          .returning();

        const DIDs: DbCreateDID[] = [
          { ...tenant.org.did!.props, orgId: tenant.org.id! },
          ...tenant.users.map((u) => {
            const userId = insertedUsers.find(
              (iu) => iu.email === u.props.email
            )?.id;
            return {
              ...u.did!.props,
              orgId,
              userId,
            };
          }),
        ];

        await trx.insert(didTable).values(DIDs);

        if (tenant.schemas.length > 0) {
          const insertedSchemas = await trx
            .insert(schemaTable)
            .values(tenant.schemas.map((s) => ({ ...s.props, orgId })))
            .returning();

          const schemaVersions = insertedSchemas.map((s) => {
            const schema = tenant.schemas.find(
              (sch) => sch.props.title === s.title
            );
            return {
              ...schema!.getLatestVersion().props,
              schemaId: s.id,
              orgId,
            };
          });

          await trx.insert(schemaVersionTable).values(schemaVersions);
        }
      })
    );
  });

  exit(0);
}

main();
