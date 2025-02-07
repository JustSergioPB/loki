import { DbFormVersion } from "@/db/schema/form-versions";
import { useCallback, useState } from "react";
import { fetchFormVersionsApi } from "../api/form-version.api";
import { Query } from "../generics/query";

export function useFormVersions() {
  const [formVersions, setFormVersions] = useState<DbFormVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchFormVersions(query: Query<DbFormVersion>) {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchFormVersionsApi(query);
      setFormVersions(data.items);
    } catch (error) {
      if (error instanceof Error) {
        return setError(error.message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return {
    formVersions,
    loading,
    error,
    fetchFormVersions: useCallback(fetchFormVersions, []),
  };
}
