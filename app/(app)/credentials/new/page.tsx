import { getUser } from "@/lib/helpers/dal";
import { searchFormVersions } from "@/lib/models/form.model";
import { redirect } from "next/navigation";
import CredentialCreateForm from "../_components/credential-create-form";

export default async function CreateCredential() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const formVersions = await searchFormVersions({
    page: 0,
    pageSize: 100,
    status: "published",
    orgId: user.orgId,
  });

  return <CredentialCreateForm formVersions={formVersions.items} />;
}
