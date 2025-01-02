import { db } from "@/db";
import { certificates } from "@/db/schema/certificates";
import { OrgCreate, orgs } from "@/db/schema/orgs";
import { schemaVersions } from "@/db/schema/schema-versions";
import { schemas } from "@/db/schema/schemas";
import { users } from "@/db/schema/users";
import { Address } from "@/lib/models/address";
import { Certificate } from "@/lib/models/certificate";
import { Org } from "@/lib/models/org";
import { Schema } from "@/lib/models/schema";
import { User } from "@/lib/models/user";
import { AddressSchema } from "@/lib/schemas/address.schema";
import { SchemaSchema } from "@/lib/schemas/schema.schema";
import { UserSchema } from "@/lib/schemas/user.schema";
import { faker } from "@faker-js/faker";
import { exit } from "process";

const ROOT_CERT = Certificate.createRoot();

function generateRandomUser(): UserSchema {
  return {
    role: faker.helpers.arrayElement(["org-admin", "issuer"]),
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    title: faker.person.jobTitle(),
  };
}

function generateRandomOrg(): OrgCreate {
  return {
    name: faker.company.name(),
  };
}

function generateRandomSchemaVersion(): SchemaSchema {
  return {
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
    title: faker.word.noun(),
    description:
      Math.random() > 0.5
        ? faker.lorem.sentences({ min: 1, max: 3 })
        : undefined,
  };
}

function generateRandomAddress(): AddressSchema {
  return {
    location: faker.location.city(),
    stateProvince: faker.location.state(),
    country: faker.location.countryCode(),
  };
}

async function generateStachelabs() {
  const org = Org.create({ name: process.env.ORG_NAME! });

  org.addAddress(Address.create(generateRandomAddress()));
  org.verify();

  const user = await User.create({
    email: process.env.USER_EMAIL!,
    fullName: process.env.USER_FULLNAME!,
    title: "Developer",
    role: "admin",
  });

  user.resetPassword(process.env.USER_PASSWORD!);

  const intermediateCert = Certificate.createIntermediate(org, ROOT_CERT);
  const endCert = Certificate.createEnd(org, intermediateCert);
  const userCert = Certificate.createEnd(org, intermediateCert, user);

  return {
    org,
    users: [user],
    certs: [intermediateCert, endCert, userCert],
    schemas: [],
  };
}

type tier = "starter" | "pro" | "enterprise";

const TIERMAP: Record<tier, { users: number; schemas: number }> = {
  starter: { users: 5, schemas: 50 },
  pro: { users: 20, schemas: 200 },
  enterprise: { users: 100, schemas: 1000 },
};

async function generateOrg(tier: tier) {
  const org = Org.create(generateRandomOrg());
  const users: User[] = [];
  const certs: Certificate[] = [];
  const schemas: Schema[] = [];

  if (Math.random() > 0.8) {
    org.addAddress(Address.create(generateRandomAddress()));

    if (Math.random() > 0.6) {
      org.verify();
      const intermediateCert = Certificate.createIntermediate(org, ROOT_CERT);
      const endCert = Certificate.createEnd(org, intermediateCert);

      certs.push(intermediateCert, endCert);

      const userPromises = Array.from({
        length: faker.number.int({ min: 1, max: TIERMAP[tier].users }),
      }).map(async () => User.create(generateRandomUser()));

      const users = await Promise.all(userPromises);
      users.push(...users);

      users.forEach((user, idx) => {
        if (idx === 0) {
          user.update({
            role: "org-admin",
            title: user.props.title!,
            fullName: user.props.fullName!,
            email: user.props.email!,
          });
          user.confirm(user.props.title!);
          certs.push(Certificate.createEnd(org, intermediateCert, user));
        } else {
          if (Math.random() > 0.8) {
            user.confirm(user.props.title!);
            certs.push(Certificate.createEnd(org, intermediateCert, user));
          }
        }
      });

      Array.from({
        length: faker.number.int({ min: 1, max: TIERMAP[tier].schemas }),
      }).forEach(() => {
        const schema = Schema.create(generateRandomSchemaVersion());
        const rand = Math.random();
        const latest = schema.getLatestVersion();

        if (rand > 0.5) {
          latest.publish();
        } else if (rand > 0.9) {
          latest.archive();
        }

        schemas.push(schema);
      });
    }
  }

  return {
    org,
    users,
    certs,
    schemas,
  };
}

async function main() {
  const tenantPromises = Array.from({ length: 10 }).map(() => {
    const tier = faker.helpers.arrayElement(["starter", "pro", "enterprise"]);
    return generateOrg(tier);
  });

  const tenants = await Promise.all([generateStachelabs(), ...tenantPromises]);

  db.transaction(async (trx) => {
    // Use Promise.all with map to wait for all tenant operations
    await Promise.all(
      tenants.map(
        async ({ org, users: orgUsers, certs, schemas: orgSchemas }) => {
          // Insert organization and get the ID
          const [{ id: orgId }] = await trx
            .insert(orgs)
            .values(org.props)
            .returning();

          // Insert users and certificates in parallel
          await Promise.all([
            trx
              .insert(users)
              .values(orgUsers.map((u) => ({ ...u.props, orgId }))),
            trx
              .insert(certificates)
              .values(certs.map((c) => ({ ...c.props, orgId }))),
          ]);

          // Process schemas and their versions sequentially
          for (const schema of orgSchemas) {
            // Insert schema and get the ID
            const [{ id: schemaId }] = await trx
              .insert(schemas)
              .values({ ...schema.props, orgId })
              .returning();

            // Insert all versions for this schema in parallel
            await Promise.all(
              schema.versions.map((version) =>
                trx
                  .insert(schemaVersions)
                  .values({ ...version.props, schemaId, orgId })
              )
            );
          }
        }
      )
    );
  });

  exit(0);
}

main();
