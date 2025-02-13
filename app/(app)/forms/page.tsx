import { formColumns } from "./_components/form-columns";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/helpers/dal";
import { DataTable } from "@/components/app/data-table";
import { SearchParams } from "@/lib/generics/search-params";
import { getParams } from "@/lib/helpers/search-params";
import { redirect } from "next/navigation";
import PageHeader from "@/components/app/page-header";
import Page from "@/components/app/page";
import Link from "next/link";
import { CirclePlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { searchFormVersions } from "@/lib/models/form-version.model";

export default async function Forms({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = await getParams(searchParams);

  const t = await getTranslations("FormVersion");
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const queryResult = await searchFormVersions({ ...query, orgId: user.orgId });

  return (
    <Page>
      <PageHeader title={t("title")} subtitle={t("subtitle")} className="p-6">
        <Link className={buttonVariants()} href="/forms/new">
          <CirclePlus />
          {t("form")}
        </Link>
      </PageHeader>
      <DataTable
        columns={formColumns}
        data={queryResult.items}
        count={queryResult.count}
        page={query.page}
        pageSize={query.pageSize}
      />
    </Page>
  );
}
