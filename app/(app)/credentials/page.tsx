import { credentialColumns } from "./columns";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/helpers/dal";
import { DataTable } from "@/components/app/data-table";
import { SearchParams } from "@/lib/generics/search-params";
import { getParams } from "@/lib/helpers/search-params";
import { redirect } from "next/navigation";
import PageHeader from "@/components/app/page-header";
import Page from "@/components/app/page";
import { searchCredentials } from "@/lib/models/credential.model";
import NewCredential from "./new";

export default async function Credentials({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = await getParams(searchParams);

  const t = await getTranslations("Credential");
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const queryResult = await searchCredentials(user, query);

  return (
    <Page>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        className="p-6"
      >
        <NewCredential>{t("credential")}</NewCredential>
      </PageHeader>
      <DataTable
        columns={credentialColumns}
        data={queryResult.items}
        count={queryResult.count}
        page={query.page}
        pageSize={query.pageSize}
      />
    </Page>
  );
}
