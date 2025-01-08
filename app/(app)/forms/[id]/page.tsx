import { db } from "@/db";
import { formTable } from "@/db/schema/forms";
import { SearchParams } from "@/lib/generics/search-params";
import { getUser } from "@/lib/helpers/dal";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { formVersionTable } from "@/db/schema/form-versions";
import { getAction } from "@/lib/helpers/search-params";
import FormForm from "../form";
import FormDetails from "./details";

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

  const queryResult = await db
    .select()
    .from(formTable)
    .where(and(eq(formTable.orgId, user.orgId), eq(formTable.id, formId)))
    .innerJoin(formVersionTable, eq(formVersionTable.formId, formId));

  if (!queryResult) {
    notFound();
  }

  const action = await getAction(searchParams);

  return action === "edit" ? (
    <FormForm
      form={{
        ...queryResult[0].forms,
        versions: queryResult.map((row) => row.formVersions),
      }}
    />
  ) : (
    <FormDetails
      form={{
        ...queryResult[0].forms,
        versions: queryResult.map((row) => row.formVersions),
      }}
    />
  );
}
