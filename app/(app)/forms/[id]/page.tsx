import { db } from "@/db";
import { schemas } from "@/db/schema/schemas";
import { SearchParams } from "@/lib/generics/search-params";
import { getUser } from "@/lib/helpers/dal";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { schemaVersions } from "@/db/schema/schema-versions";
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
  const schemaId = Number((await params).id);

  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const queryResult = await db
    .select()
    .from(schemas)
    .where(and(eq(schemas.orgId, user.orgId), eq(schemas.id, schemaId)))
    .innerJoin(schemaVersions, eq(schemaVersions.schemaId, schemaId));

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
