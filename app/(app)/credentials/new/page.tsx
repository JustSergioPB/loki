import { getUser } from "@/lib/helpers/dal";
import { searchForms } from "@/lib/models/form.model";
import { redirect } from "next/navigation";
import CredentialForm from "./form";

export default async function CreateCredential() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const formVersions = await searchForms({
    page: 0,
    pageSize: 100,
    status: "published",
    orgId: user.orgId,
  });

  return <CredentialForm formVersions={formVersions.items} />;
}
