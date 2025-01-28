import { getUser } from "@/lib/helpers/dal";
import FormForm from "../../form";
import { notFound, redirect } from "next/navigation";
import { getFormById } from "@/lib/models/form.model";

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

  const formVersion = await getFormById(user, id);

  if (!formVersion) {
    notFound();
  }

  return <FormForm formVersion={formVersion} />;
}
