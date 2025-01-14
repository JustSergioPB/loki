import { SearchParams } from "@/lib/generics/search-params";
import { getUser } from "@/lib/helpers/dal";
import { notFound, redirect } from "next/navigation";
import { getAction } from "@/lib/helpers/search-params";
import FormForm from "../form";
import FormDetails from "./details";
import { getFormById } from "@/lib/models/form.model";

export default async function Form({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const formId = (await params).id;

  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const formVersion = await getFormById(user, formId);

  if (!formVersion) {
    notFound();
  }

  const action = await getAction(searchParams);

  return action === "edit" ? (
    <FormForm formVersion={formVersion} />
  ) : (
    <FormDetails formVersion={formVersion} />
  );
}
