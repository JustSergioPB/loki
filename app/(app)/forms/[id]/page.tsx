import { db } from "@/db";
import { schemaTable } from "@/db/schema/schemas";
import { SearchParams } from "@/lib/generics/search-params";
import { getUser } from "@/lib/helpers/dal";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { schemaVersionTable } from "@/db/schema/schema-versions";
import { getAction } from "@/lib/helpers/search-params";
import SchemaForm from "../form";
import SchemaDetails from "./details";

export default async function Schema({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const schemaId = (await params).id;

  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const queryResult = await db
    .select()
    .from(schemaTable)
    .where(and(eq(schemaTable.orgId, user.orgId), eq(schemaTable.id, schemaId)))
    .innerJoin(schemaVersionTable, eq(schemaVersionTable.schemaId, schemaId));

  if (!queryResult) {
    notFound();
  }

  const action = await getAction(searchParams);

  return action === "edit" ? (
    <SchemaForm
      schema={{
        ...queryResult[0].schemas,
        versions: queryResult.map((row) => row.schemaVersions),
      }}
    />
  ) : (
    <SchemaDetails
      schema={{
        ...queryResult[0].schemas,
        versions: queryResult.map((row) => row.schemaVersions),
      }}
    />
  );
}
