import { db } from "@/db";
import { DbCreateDID, didTable } from "@/db/schema/dids";
import { orgTable } from "@/db/schema/orgs";
import { formVersionTable } from "@/db/schema/form-versions";
import { formTable } from "@/db/schema/forms";
import { userTable } from "@/db/schema/users";
import { DID } from "@/lib/models/did";
import { CreateOrgProps, Org } from "@/lib/models/org";
import { OrgDID } from "@/lib/models/org-did";
import { orgTierTypes, TIER_MAP } from "@/lib/models/org-tier";
import { Form } from "@/lib/models/form";
import { CreateUserProps, User, userRoles } from "@/lib/models/user";
import { UuidDIDProvider } from "@/providers/did.provider";
import { faker } from "@faker-js/faker";
import { exit } from "process";
import { FakeHSMProvider } from "@/providers/key-pair.provider";
import { Credential } from "@/lib/models/credential";
import * as uuid from "uuid";
import { credentialTable, DbCreateCredential } from "@/db/schema/credentials";

const BASE_URL = process.env.BASE_URL!;
const keyPairProvider = new FakeHSMProvider();
const didProvider = new UuidDIDProvider(keyPairProvider, BASE_URL);

type Tenant = {
  org: Org;
  users: User[];
  forms: Form[];
  dids: DID[];
  credentials: Credential[];
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

function generateRandomFormVersion(): Form {
  const randValidity = Math.random();
  const form = Form.create({
    title: faker.lorem.words({ min: 2, max: 4 }),
    type: [
      ...Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () =>
        faker.word.noun()
      ),
    ],
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
  const latest = form.latestVersion;

  if (rand > 0.4) {
    latest.publish();
  } else if (rand > 0.9) {
    latest.archive();
  }

  return form;
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

  org.verify();
  user.confirm(user.props.position!);

  const orgDID = await didProvider.generateRootDID(org);
  const userDID = await didProvider.generateUserDID(orgDID);
  const delegationProofForm = Form.create({
    title: process.env.DELEGATION_PROOF!,
    description: "Proof that allows a user to issue credentials",
    type: ["DelegationProof"],
    content: {
      isAllowedToSign: {
        type: "boolean",
      },
    },
  });

  delegationProofForm.latestVersion.publish();

  const delegationProof = delegationProofForm.fill(
    {
      claims: { isAllowedToSign: true },
      validFrom: undefined,
      validUntil: undefined,
      id: `${BASE_URL!}/${uuid.v7()}`,
    },
    BASE_URL,
    orgDID,
    userDID
  );

  const cypher = await keyPairProvider.signAndEncrypt(
    orgDID.signingLabel,
    delegationProof
  );

  return {
    org,
    users: [user],
    dids: [orgDID, userDID],
    forms: [delegationProofForm],
    credentials: [cypher],
  };
}

async function generateTenant(
  rootDID: OrgDID,
  delegationProofForm: Form
): Promise<Tenant> {
  const org = Org.create(generateRandomOrg());
  const users: User[] = [User.signUp(generateRandomUser())];
  const forms: Form[] = [];
  const dids: DID[] = [];
  const credentials: Credential[] = [];

  if (Math.random() > 0.4) {
    const orgDID = await didProvider.generateOrgDID(rootDID);
    dids.push(orgDID);
    org.verify();

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
              const userDID = await didProvider.generateUserDID(orgDID);
              const delegationProof = delegationProofForm.fill(
                {
                  claims: { isAllowedToSign: true },
                  validFrom: undefined,
                  validUntil: undefined,
                  id: `${BASE_URL!}/${uuid.v7()}`,
                },
                BASE_URL,
                orgDID,
                userDID
              );

              const cypher = await keyPairProvider.signAndEncrypt(
                orgDID.signingLabel,
                delegationProof
              );

              dids.push(userDID);
              credentials.push(cypher);
              user.confirm(user.props.position!);
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

    forms.push(
      ...Array.from(
        {
          length: faker.number.int({
            min: 1,
            max: TIER_MAP[org.props.tier].forms,
          }),
        },
        () => generateRandomFormVersion()
      )
    );
  }

  return {
    org,
    users,
    dids,
    forms,
    credentials,
  };
}

async function main() {
  const rootTenant = await generateStachelabs();
  const tenants = [rootTenant];
  const randTenants = await Promise.all(
    Array.from(
      { length: 10 },
      async () => await generateTenant(rootTenant.dids[0], rootTenant.forms[0])
    )
  );
  tenants.push(...randTenants);
  let delegationFormVersionId: string | undefined;

  await db.transaction(async (trx) => {
    await Promise.all(
      tenants.map(async (tenant, idx) => {
        const [{ id: orgId }] = await trx
          .insert(orgTable)
          .values(tenant.org.props)
          .returning();

        const insertedUsers = await trx
          .insert(userTable)
          .values(tenant.users.map((u) => ({ ...u.props, orgId })))
          .returning();

        if (tenant.forms.length > 0) {
          const insertedForms = await trx
            .insert(formTable)
            .values(tenant.forms.map((s) => ({ ...s.props, orgId })))
            .returning();

          const formVersions = insertedForms.map((s) => {
            const form = tenant.forms.find(
              (sch) => sch.props.title === s.title
            );
            return {
              ...form!.latestVersion.props,
              formId: s.id,
              orgId,
            };
          });

          const insertedFormVersions = await trx
            .insert(formVersionTable)
            .values(formVersions)
            .returning();

          if (idx === 0) {
            const formId = insertedForms.find(
              (iform) => iform.title === process.env.DELEGATION_PROOF!
            )!.id;
            delegationFormVersionId = insertedFormVersions.find(
              (isf) => isf.formId === formId
            )!.id;
          }
        }

        if (tenant.org.props.status === "verified") {
          const DIDs: DbCreateDID[] = [
            { ...tenant.dids[0].props, orgId },
            ...tenant.dids.slice(1).map((did, index) => {
              const users = insertedUsers.filter((iu) => iu.confirmedAt);
              return {
                ...did.props,
                orgId,
                userId: users[index].id,
              };
            }),
          ];

          await trx.insert(didTable).values(DIDs);

          const ciphers: DbCreateCredential[] = tenant.credentials.map(
            (cipher, index) => {
              const users = insertedUsers.filter((iu) => iu.confirmedAt);
              return {
                ...cipher.props,
                formVersionId: delegationFormVersionId!,
                orgId,
                userId: users[index].id,
              };
            }
          );

          await trx.insert(credentialTable).values(ciphers);
        }
      })
    );
  });

  exit(0);
}

main();
