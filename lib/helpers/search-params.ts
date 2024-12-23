import { SearchParams } from "../generics/search-params";

export async function getParams(
  searchParams: SearchParams
): Promise<{ page: number; pageSize: number }> {
  const params = await searchParams;

  const page =
    !params.page || Array.isArray(params.page) ? 0 : parseInt(params.page);
  const pageSize =
    !params.pageSize || Array.isArray(params.pageSize)
      ? 10
      : parseInt(params.pageSize);

  return { page, pageSize };
}
