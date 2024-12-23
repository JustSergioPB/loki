import { userColumns } from "./columns";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/helpers/dal";
import { DataTable } from "@/components/app/data-table";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { SearchParams } from "@/lib/generics/search-params";
import { getParams } from "@/lib/helpers/search-params";
import { redirect } from "next/navigation";
import { eq, count } from "drizzle-orm";
import { orgs } from "@/db/schema/orgs";
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
      id: users.id,
      publicId: users.publicId,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      status: users.status,
      confirmedAt: users.confirmedAt,
      updatedAt: users.updatedAt,
      createdAt: users.createdAt,
      org: {
        name: orgs.name,
      },
    })
    .from(users)
    .limit(pageSize)
    .offset(page * pageSize)
    .innerJoin(orgs, eq(users.orgId, orgs.id))
    .orderBy(users.orgId);

  const countQuery = db.select({ count: count() }).from(users);

  if (user.role !== "admin") {
    query.where(eq(users.orgId, user.orgId));
    countQuery.where(eq(users.orgId, user.orgId));
  }

  const queryResult = await query;
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
