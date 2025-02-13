import { userColumns } from "./_components/user-columns";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/helpers/dal";
import { DataTable } from "@/components/app/data-table";
import { SearchParams } from "@/lib/generics/search-params";
import { getParams } from "@/lib/helpers/search-params";
import { redirect } from "next/navigation";
import PageHeader from "@/components/app/page-header";
import Page from "@/components/app/page";
import { searchUsers } from "@/lib/models/user.model";
import UserCreateDialog from "./_components/user-create-dialog";

export default async function Users({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = await getParams(searchParams);

  const t = await getTranslations("User");
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const queryResult = await searchUsers(user, query);

  return (
    <Page>
      <PageHeader title={t("title")} subtitle={t("subtitle")} className="p-6">
        <UserCreateDialog />
      </PageHeader>
      <DataTable
        columns={userColumns}
        data={queryResult.items}
        count={queryResult.count}
        page={query.page}
        pageSize={query.pageSize}
      />
    </Page>
  );
}
