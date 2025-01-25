import { orgColumns } from "./columns";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/helpers/dal";
import { DataTable } from "@/components/app/data-table";
import { SearchParams } from "@/lib/generics/search-params";
import { getParams } from "@/lib/helpers/search-params";
import { redirect } from "next/navigation";
import PageHeader from "@/components/app/page-header";
import Page from "@/components/app/page";
import { searchOrgs } from "@/lib/models/org.model";

export default async function Orgs({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = await getParams(searchParams);

  const t = await getTranslations("Org");
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const queryResult = await searchOrgs(query);

  return (
    <Page>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        className="p-6"
      />
      <DataTable
        columns={orgColumns}
        data={queryResult.items}
        count={queryResult.count}
        page={query.page}
        pageSize={query.pageSize}
      />
    </Page>
  );
}
