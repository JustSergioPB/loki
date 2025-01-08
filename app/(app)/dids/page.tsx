import { orgColumns } from "./columns";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/helpers/dal";
import { DataTable } from "@/components/app/data-table";
import { db } from "@/db";
import { SearchParams } from "@/lib/generics/search-params";
import { getParams } from "@/lib/helpers/search-params";
import { redirect } from "next/navigation";
import { count, desc } from "drizzle-orm";
import { orgTable } from "@/db/schema/orgs";
import PageHeader from "@/components/app/page-header";
import Page from "@/components/app/page";
import { DbDID, didTable } from "@/db/schema/dids";
import { eq } from "drizzle-orm";
import { userTable } from "@/db/schema/users";

export default async function DIDs({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { page, pageSize } = await getParams(searchParams);

  const t = await getTranslations("Did");
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const queryResult = await db
    .select()
    .from(didTable)
    .limit(pageSize)
    .offset(page * pageSize)
    .innerJoin(orgTable, eq(didTable.orgId, orgTable.id))
    .leftJoin(userTable, eq(didTable.userId, userTable.id))
    .orderBy(desc(didTable.createdAt));

  const [{ count: countResult }] = await db
    .select({ count: count() })
    .from(didTable);

  const mapped: DbDID[] = queryResult.map(({ orgs, users, dids }) => ({
    ...dids,
    org: orgs,
    user: users ?? undefined,
  }));

  return (
    <Page>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <DataTable
        columns={orgColumns}
        data={mapped}
        count={countResult}
        page={page}
        pageSize={pageSize}
      />
    </Page>
  );
}
