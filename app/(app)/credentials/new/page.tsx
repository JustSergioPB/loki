import { getUser } from "@/lib/helpers/dal";
import { searchFormVersions } from "@/lib/models/form-version.model";
import { redirect } from "next/navigation";
import CredentialFillStepper from "../_components/credential-fill-stepper";

export default async function NewCredential() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const formVersions = await searchFormVersions({
    orgId: user.orgId,
    page: 0,
    pageSize: 500,
    status: "published",
  });

  return (
    <CredentialFillStepper
      formVersions={formVersions.items}
      credential={null}
    />
  );
}
