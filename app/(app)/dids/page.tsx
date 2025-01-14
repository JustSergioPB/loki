import { orgColumns } from "./columns";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/helpers/dal";
import { DataTable } from "@/components/app/data-table";
import { SearchParams } from "@/lib/generics/search-params";
import { getParams } from "@/lib/helpers/search-params";
import { redirect } from "next/navigation";
import PageHeader from "@/components/app/page-header";
import Page from "@/components/app/page";
import { searchDIDs } from "@/lib/models/did.model";

//TODO: ??? Add feature to allow orgs to create specific dids so they can create an identity for a holder within the org ex: a cosco client a service endpoint of discounts
export default async function DIDs({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = await getParams(searchParams);

  const t = await getTranslations("Did");
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const queryResult = await searchDIDs(user, query);

  return (
    <Page>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
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
