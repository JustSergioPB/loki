import { userColumns } from "./columns";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/helpers/dal";
import { DataTable } from "@/components/app/data-table";
import { db } from "@/db";
import { SearchParams } from "@/lib/generics/search-params";
import { getParams } from "@/lib/helpers/search-params";
import { redirect } from "next/navigation";
import { count, desc, eq } from "drizzle-orm";
import { orgs } from "@/db/schema/orgs";
import PageHeader from "@/components/app/page-header";
import Page from "@/components/app/page";
import { address } from "@/db/schema/address";

export default async function Orgs({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { page, pageSize } = await getParams(searchParams);

  const t = await getTranslations("Org");
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const queryResult = await db
    .select()
    .from(orgs)
    .limit(pageSize)
    .offset(page * pageSize)
    .leftJoin(address, eq(address.orgId, orgs.id))
    .orderBy(desc(orgs.createdAt));

  const [{ count: countResult }] = await db
    .select({ count: count() })
    .from(orgs);

  const mapped = queryResult.map(({ orgs, address }) => ({
    ...orgs,
    address: address ?? undefined,
  }));

  return (
    <Page>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <DataTable
        columns={userColumns}
        data={mapped}
        count={countResult}
        page={page}
        pageSize={pageSize}
      />
    </Page>
  );
}
