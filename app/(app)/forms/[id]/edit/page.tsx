import { getUser } from "@/lib/helpers/dal";
import { forbidden, notFound, redirect } from "next/navigation";
import { getFormVersionById } from "@/lib/models/form-version.model";
import FormEditForm from "../../_components/form-edit-form";

export default async function EditForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }
  const formVersion = await getFormVersionById(id);

  if (!formVersion) {
    notFound();
  }

  if (user.orgId !== formVersion.orgId) {
    forbidden();
  }

  return <FormEditForm formVersion={formVersion} />;
}
