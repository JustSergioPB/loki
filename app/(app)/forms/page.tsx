import { schemaColumns } from "./columns";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/helpers/dal";
import { DataTable } from "@/components/app/data-table";
import { db } from "@/db";
import { schemas } from "@/db/schema/schemas";
import { SearchParams } from "@/lib/generics/search-params";
import { getParams } from "@/lib/helpers/search-params";
import { redirect } from "next/navigation";
import { eq, count, desc, inArray } from "drizzle-orm";
import PageHeader from "@/components/app/page-header";
import Page from "@/components/app/page";
import { schemaVersions } from "@/db/schema/schema-versions";
import NewSchema from "./new";

export default async function Schemas({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { page, pageSize } = await getParams(searchParams);

  const t = await getTranslations("Schema");
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const paginatedSchemas = await db
    .select()
    .from(schemas)
    .where(eq(schemas.orgId, user.orgId))
    .limit(pageSize)
    .offset(page * pageSize)
    .orderBy(desc(schemas.createdAt));

  const schemaIds = paginatedSchemas.map((schema) => schema.id);

  const versionsForSchemas =
    schemaIds.length > 0
      ? await db
          .select()
          .from(schemaVersions)
          .where(inArray(schemaVersions.schemaId, schemaIds))
      : [];

  // Combine the results
  const combinedResults = paginatedSchemas.map((schema) => ({
    ...schema,
    versions: versionsForSchemas.filter(
      (version) => version.schemaId === schema.id
    ),
  }));

  const [{ count: countResult }] = await db
    .select({ count: count() })
    .from(schemas)
    .where(eq(schemas.orgId, user.orgId));

  return (
    <Page>
      <PageHeader title={t("title")} subtitle={t("subtitle")}>
        <NewSchema />
      </PageHeader>
      <DataTable
        columns={schemaColumns}
        data={combinedResults}
        count={countResult}
        page={page}
        pageSize={pageSize}
      />
    </Page>
  );
}
