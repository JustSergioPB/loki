import { credentialColumns } from "./columns";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/helpers/dal";
import { DataTable } from "@/components/app/data-table";
import { db } from "@/db";
import { SearchParams } from "@/lib/generics/search-params";
import { getParams } from "@/lib/helpers/search-params";
import { redirect } from "next/navigation";
import { count, desc, eq } from "drizzle-orm";
import { credentialTable, DbCredential } from "@/db/schema/credentials";
import PageHeader from "@/components/app/page-header";
import Page from "@/components/app/page";
import { userTable } from "@/db/schema/users";
import { formVersionTable } from "@/db/schema/form-versions";

export default async function Credentials({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { page, pageSize } = await getParams(searchParams);

  const t = await getTranslations("Credential");
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const credentialQuery = await db
    .select()
    .from(credentialTable)
    .limit(pageSize)
    .offset(page * pageSize)
    .where(eq(credentialTable.orgId, user.orgId))
    .orderBy(desc(credentialTable.createdAt))
    .leftJoin(userTable, eq(userTable.id, credentialTable.userId))
    .innerJoin(
      formVersionTable,
      eq(formVersionTable.id, credentialTable.formVersionId)
    );

  const countQuery = await db
    .select({ count: count() })
    .from(credentialTable)
    .where(eq(credentialTable.orgId, user.orgId));

  const mapped: DbCredential[] = credentialQuery.map(
    ({ credentials, users, formVersions }) => ({
      ...credentials,
      user: users ?? undefined,
      formVersion: formVersions,
    })
  );

  return (
    <Page>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <DataTable
        columns={credentialColumns}
        data={mapped}
        count={countQuery[0]!.count}
        page={page}
        pageSize={pageSize}
      />
    </Page>
  );
}
