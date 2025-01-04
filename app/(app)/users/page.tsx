import { userColumns } from "./columns";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/helpers/dal";
import { DataTable } from "@/components/app/data-table";
import { db } from "@/db";
import { userTable } from "@/db/schema/users";
import { SearchParams } from "@/lib/generics/search-params";
import { getParams } from "@/lib/helpers/search-params";
import { redirect } from "next/navigation";
import { eq, count } from "drizzle-orm";
import { orgTable } from "@/db/schema/orgs";
import PageHeader from "@/components/app/page-header";
import Page from "@/components/app/page";
import NewUser from "./new";

export default async function Users({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { page, pageSize } = await getParams(searchParams);

  const t = await getTranslations("User");
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const query = db
    .select({
      id: userTable.id,
      fullName: userTable.fullName,
      email: userTable.email,
      role: userTable.role,
      status: userTable.status,
      confirmedAt: userTable.confirmedAt,
      updatedAt: userTable.updatedAt,
      createdAt: userTable.createdAt,
      orgId: userTable.orgId,
      org: {
        name: orgTable.name,
      },
    })
    .from(userTable)
    .limit(pageSize)
    .offset(page * pageSize)
    .innerJoin(orgTable, eq(userTable.orgId, orgTable.id))
    .orderBy(userTable.orgId);

  const countQuery = db.select({ count: count() }).from(userTable);

  if (user.role !== "admin") {
    query.where(eq(userTable.orgId, user.orgId));
    countQuery.where(eq(userTable.orgId, user.orgId));
  }

  const queryResult = (await query).map((row) => ({
    ...row,
    password: "********",
  }));
  const [{ count: countResult }] = await countQuery;

  return (
    <Page>
      <PageHeader title={t("title")} subtitle={t("subtitle")}>
        <NewUser>{t("user")}</NewUser>
      </PageHeader>
      <DataTable
        columns={userColumns}
        data={queryResult}
        count={countResult}
        page={page}
        pageSize={pageSize}
      />
    </Page>
  );
}
