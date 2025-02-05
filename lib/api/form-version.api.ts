import { DbFormVersion } from "@/db/schema/form-versions";
import { FormVersionError } from "../errors/form-version.error";
import { QueryResult } from "../generics/query-result";
import { Query } from "../generics/query";

const BASE_URL = "/api/forms";

export async function fetchFormVersionsApi(
  query: Query<DbFormVersion>
): Promise<QueryResult<DbFormVersion>> {
  const url = new URL(BASE_URL, window.location.origin);
  const urlQuery = new URLSearchParams();
  urlQuery.append("page", query.page.toString());
  urlQuery.append("pageSize", query.pageSize.toString());

  if (query.orgId) {
    urlQuery.append("orgId", query.orgId.toString());
  }

  url.search = urlQuery.toString();

  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    throw new FormVersionError("searchFailed");
  }

  return response.json();
}
