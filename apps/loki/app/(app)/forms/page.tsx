import { formColumns } from "./columns";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/helpers/dal";
import { DataTable } from "@/components/app/data-table";
import { db } from "@/db";
import { formTable } from "@/db/schema/forms";
import { SearchParams } from "@/lib/generics/search-params";
import { getParams } from "@/lib/helpers/search-params";
import { redirect } from "next/navigation";
import { eq, count, desc, inArray } from "drizzle-orm";
import PageHeader from "@/components/app/page-header";
import Page from "@/components/app/page";
import { formVersionTable } from "@/db/schema/form-versions";
import NewForm from "./new";

export default async function Forms({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { page, pageSize } = await getParams(searchParams);

  const t = await getTranslations("Form");
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const formQuery = await db
    .select()
    .from(formTable)
    .where(eq(formTable.orgId, user.orgId))
    .limit(pageSize)
    .offset(page * pageSize)
    .orderBy(desc(formTable.createdAt));

  const formIds = formQuery.map((form) => form.id);

  const versionsForForms =
    formIds.length > 0
      ? await db
          .select()
          .from(formVersionTable)
          .where(inArray(formVersionTable.formId, formIds))
      : [];

  // Combine the results
  const combinedResults = formQuery.map((form) => ({
    ...form,
    versions: versionsForForms.filter((version) => version.formId === form.id),
  }));

  const countQuery = await db
    .select({ count: count() })
    .from(formTable)
    .where(eq(formTable.orgId, user.orgId));

  return (
    <Page>
      <PageHeader title={t("title")} subtitle={t("subtitle")}>
        <NewForm />
      </PageHeader>
      <DataTable
        columns={formColumns}
        data={combinedResults}
        count={countQuery[0]!.count}
        page={page}
        pageSize={pageSize}
      />
    </Page>
  );
}
