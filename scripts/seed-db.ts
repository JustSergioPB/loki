import { confirmUserAccount, signUpUser } from "@/lib/models/auth.model";
import { createRootDID } from "@/lib/models/did.model";
import { createForm, publishForm } from "@/lib/models/form.model";
import { exit } from "process";
import { faker } from "@faker-js/faker";
import { verifyOrg } from "@/lib/models/org.model";
import { createEmailBridge } from "@/lib/models/email-bridge.model";
import { FORMS } from "@/lib/consts/form.consts";

async function main() {
  const { user, userToken, org } = await signUpUser({
    fullName: process.env.USER_FULLNAME!,
    email: process.env.USER_EMAIL!,
    orgName: process.env.ORG_NAME!,
    password: process.env.USER_PASSWORD!,
    confirmPassword: process.env.USER_PASSWORD!,
  });

  const insertedForms = await Promise.all(
    FORMS.map(async (form) => await createForm(user, form))
  );

  await Promise.all(
    insertedForms.map(async ({ id }) => await publishForm(user, id))
  );

  await createRootDID(user);
  await confirmUserAccount(userToken.id, faker.person.jobTitle());
  await verifyOrg(user, org.id);
  await createEmailBridge(user, ["stachelabs.com", "stachelabs.es"]);

  exit(0);
}

main();
