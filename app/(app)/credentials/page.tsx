import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/helpers/dal";
import { DataTable } from "@/components/app/data-table";
import { SearchParams } from "@/lib/generics/search-params";
import { getParams } from "@/lib/helpers/search-params";
import { redirect } from "next/navigation";
import PageHeader from "@/components/app/page-header";
import Page from "@/components/app/page";
import { searchCredentials } from "@/lib/models/credential.model";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CirclePlus } from "lucide-react";
import Link from "next/link";
import { credentialColumns } from "./_components/credential-columns";

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
      <PageHeader title={t("title")} subtitle={t("subtitle")} className="p-6">
        <Link href="/credentials/new" className={cn(buttonVariants())}>
          <CirclePlus />
          {t("credential")}
        </Link>
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
