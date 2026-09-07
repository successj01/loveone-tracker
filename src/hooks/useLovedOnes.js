import { useCallback, useEffect, useState } from "react";
import { onRequest } from "@/services/socketService";
import * as lovedOnesService from "@/services/lovedOnesService";

export function useLovedOnes(ownerId) {
  const [lovedOnes, setLovedOnes] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!ownerId) {
      setLovedOnes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const rows = await lovedOnesService.listLovedOnes(ownerId);
      setLovedOnes(rows);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const off = onRequest(() => {
      refresh();
    });
    return off;
  }, [refresh]);

  const remove = useCallback(
    async (id) => {
      await lovedOnesService.removeLovedOne(id);
      await refresh();
    },
    [refresh]
  );

  return { lovedOnes, loading, refresh, remove };
}